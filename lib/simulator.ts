export interface SimulationParams {
  riskPerTrade: number;
  tradesPerDay: number;
  winRate: number; // 0-100
  riskRewardRatio: number;
  maxDrawdown: number;
  ddMode: "static" | "eod";
  profitColchon: number; // EOD only: first target, after which floor freezes
  profitTarget: number;
  simulations: number;
}

export interface TradeResult {
  tradeNumber: number;
  result: number;
  accumulated: number;
  isWin: boolean;
  floor: number;
}

export interface SimulationResult {
  simIndex: number;
  outcome: "profit" | "drawdown";
  tradesNeeded: number;
  finalBalance: number;
  maxDrawdownReached: number;
  maxWinStreak: number;
  maxLoseStreak: number;
  trades: TradeResult[];
}

export interface AggregatedStats {
  totalSimulations: number;
  profitCount: number;
  drawdownCount: number;
  successProbability: number;
  failureProbability: number;
  avgTradesForProfit: number;
  avgTradesForDrawdown: number;
  maxTradesObserved: number;
  minTradesObserved: number;
  results: SimulationResult[];
  distributionByTrades: { range: string; count: number }[];
  profitCountByTrade: { trades: number; count: number }[];
}

function runSingleSimulation(
  params: SimulationParams,
  simIndex: number
): SimulationResult {
  const { riskPerTrade, tradesPerDay, winRate, riskRewardRatio, maxDrawdown, ddMode, profitColchon, profitTarget } = params;
  const rewardPerTrade = riskPerTrade * riskRewardRatio;

  let accumulated = 0;
  let peakBalance = 0;   // EOD phase 1: tracks highest closing balance
  let frozenFloor = 0;   // EOD phase 2: floor locked when colchon is reached
  let colchonReached = false;
  let tradeNumber = 0;
  let maxDrawdownReached = 0;
  let maxWinStreak = 0;
  let maxLoseStreak = 0;
  let currentWinStreak = 0;
  let currentLoseStreak = 0;
  const trades: TradeResult[] = [];

  while (true) {
    tradeNumber++;

    // Simulate each trade in the day independently
    let dayResult = 0;
    for (let t = 0; t < tradesPerDay; t++) {
      const random = Math.floor(Math.random() * 100) + 1;
      const isWin = random <= winRate;
      dayResult += isWin ? rewardPerTrade : -riskPerTrade;
    }

    const isWin = dayResult > 0;
    accumulated += dayResult;

    if (isWin) {
      currentWinStreak++;
      currentLoseStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else {
      currentLoseStreak++;
      currentWinStreak = 0;
      if (currentLoseStreak > maxLoseStreak) maxLoseStreak = currentLoseStreak;
    }

    // Determine floor and track max drawdown
    let floor: number;
    if (ddMode === "eod") {
      if (!colchonReached) {
        // Phase 1 EOD: floor follows peak
        if (accumulated > peakBalance) peakBalance = accumulated;
        floor = peakBalance - maxDrawdown;
        const dd = peakBalance - accumulated;
        if (dd > maxDrawdownReached) maxDrawdownReached = dd;
        // Transition to static when colchon is reached
        if (accumulated >= profitColchon) {
          colchonReached = true;
          frozenFloor = floor; // freeze current floor
        }
      } else {
        // Phase 2 static: floor is frozen
        floor = frozenFloor;
        const dd = accumulated < (frozenFloor + maxDrawdown) ? (frozenFloor + maxDrawdown) - accumulated : 0;
        if (dd > maxDrawdownReached) maxDrawdownReached = dd;
      }
    } else {
      floor = -maxDrawdown;
      if (accumulated < 0 && Math.abs(accumulated) > maxDrawdownReached) {
        maxDrawdownReached = Math.abs(accumulated);
      }
    }

    trades.push({ tradeNumber, result: dayResult, accumulated, isWin, floor });

    if (accumulated >= profitTarget) {
      return {
        simIndex,
        outcome: "profit",
        tradesNeeded: tradeNumber,
        finalBalance: accumulated,
        maxDrawdownReached,
        maxWinStreak,
        maxLoseStreak,
        trades,
      };
    }

    if (accumulated <= floor) {
      return {
        simIndex,
        outcome: "drawdown",
        tradesNeeded: tradeNumber,
        finalBalance: accumulated,
        maxDrawdownReached,
        maxWinStreak,
        maxLoseStreak,
        trades,
      };
    }

    if (tradeNumber > 100000) {
      return {
        simIndex,
        outcome: "drawdown",
        tradesNeeded: tradeNumber,
        finalBalance: accumulated,
        maxDrawdownReached,
        maxWinStreak,
        maxLoseStreak,
        trades,
      };
    }
  }
}

export function runSimulations(params: SimulationParams): AggregatedStats {
  const results: SimulationResult[] = [];

  for (let i = 1; i <= params.simulations; i++) {
    results.push(runSingleSimulation(params, i));
  }

  const profitResults = results.filter((r) => r.outcome === "profit");
  const drawdownResults = results.filter((r) => r.outcome === "drawdown");

  const profitCount = profitResults.length;
  const drawdownCount = drawdownResults.length;
  const totalSimulations = results.length;

  const avgTradesForProfit =
    profitCount > 0
      ? profitResults.reduce((s, r) => s + r.tradesNeeded, 0) / profitCount
      : 0;

  const avgTradesForDrawdown =
    drawdownCount > 0
      ? drawdownResults.reduce((s, r) => s + r.tradesNeeded, 0) / drawdownCount
      : 0;

  const allTrades = results.map((r) => r.tradesNeeded);
  const maxTradesObserved = Math.max(...allTrades);
  const minTradesObserved = Math.min(...allTrades);

  // Distribution by trades buckets
  const buckets = 10;
  const bucketSize = Math.ceil((maxTradesObserved - minTradesObserved + 1) / buckets) || 1;
  const distributionMap: Record<string, number> = {};
  for (const r of results) {
    const bucketStart = Math.floor((r.tradesNeeded - minTradesObserved) / bucketSize) * bucketSize + minTradesObserved;
    const bucketEnd = bucketStart + bucketSize - 1;
    const key = `${bucketStart}-${bucketEnd}`;
    distributionMap[key] = (distributionMap[key] || 0) + 1;
  }
  const distributionByTrades = Object.entries(distributionMap)
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => parseInt(a.range) - parseInt(b.range));

  // Profit count by trade (for chart: how many profit sims needed X trades)
  const profitByTradeMap: Record<number, number> = {};
  for (const r of profitResults) {
    profitByTradeMap[r.tradesNeeded] = (profitByTradeMap[r.tradesNeeded] || 0) + 1;
  }
  const profitCountByTrade = Object.entries(profitByTradeMap)
    .map(([trades, count]) => ({ trades: Number(trades), count }))
    .sort((a, b) => a.trades - b.trades);

  return {
    totalSimulations,
    profitCount,
    drawdownCount,
    successProbability: (profitCount / totalSimulations) * 100,
    failureProbability: (drawdownCount / totalSimulations) * 100,
    avgTradesForProfit,
    avgTradesForDrawdown,
    maxTradesObserved,
    minTradesObserved,
    results,
    distributionByTrades,
    profitCountByTrade,
  };
}
