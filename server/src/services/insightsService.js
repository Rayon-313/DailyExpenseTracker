import Expense from '../models/Expense.js';

const pct = (change) => Math.round(Math.abs(change) * 10) / 10;
const inRange = (e, start, end) => e.date >= start && e.date <= end;
const sumByCategory = (list) => list.reduce((acc, e) => {
  acc[e.category] = (acc[e.category] || 0) + e.amount;
  return acc;
}, {});

export const generateInsights = async (userId) => {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - 30);
  const prevStart = new Date(now);
  prevStart.setDate(now.getDate() - 60);

  const expenses = await Expense.find({
    user: userId,
    date: { $gte: prevStart, $lte: now },
  });

  const current = expenses.filter((e) => inRange(e, currentStart, now));
  const previous = expenses.filter((e) => inRange(e, prevStart, currentStart));

  const insights = [];
  const cur = sumByCategory(current);
  const prev = sumByCategory(previous);

  const curTotal = current.reduce((s, e) => s + e.amount, 0);
  const prevTotal = previous.reduce((s, e) => s + e.amount, 0);

  if (prevTotal > 0 && curTotal > 0) {
    const change = ((curTotal - prevTotal) / prevTotal) * 100;
    if (change > 10) {
      insights.push({
        type: 'warning',
        title: 'Total spending increased',
        message: `Your total spending rose by ${Math.round(change)}% compared to the previous 30 days.`,
      });
    } else if (change < -10) {
      insights.push({
        type: 'success',
        title: 'Total spending decreased',
        message: `Your total spending dropped by ${Math.round(Math.abs(change))}% compared to the previous 30 days. Keep it up!`,
      });
    }
  }

  const categories = new Set([...Object.keys(cur), ...Object.keys(prev)]);
  for (const category of categories) {
    const c = cur[category] || 0;
    const p = prev[category] || 0;
    if (p > 0 && c > p) {
      const change = ((c - p) / p) * 100;
      if (change >= 10) {
        insights.push({
          type: 'warning',
          title: `${category} spending increased`,
          message: `${category} spending increased by ${pct(change)}% compared to the previous 30 days.`,
        });
      }
    } else if (p > 0 && c < p) {
      const change = ((p - c) / p) * 100;
      if (change >= 10) {
        insights.push({
          type: 'success',
          title: `${category} spending decreased`,
          message: `${category} spending decreased by ${pct(change)}% compared to the previous 30 days.`,
        });
      }
    } else if (p === 0 && c > 0) {
      insights.push({
        type: 'info',
        title: `New spending on ${category}`,
        message: `You started spending on ${category} — Rs. ${Math.round(c).toLocaleString('en-IN')} in the last 30 days.`,
      });
    } else if (c === 0 && p > 0) {
      insights.push({
        type: 'info',
        title: `No ${category} spending`,
        message: `You didn't spend on ${category} in the last 30 days.`,
      });
    }
  }

  const topCategory = Object.entries(cur).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && curTotal > 0) {
    insights.push({
      type: 'info',
      title: 'Top spending category',
      message: `${topCategory[0]} is your biggest expense category this month at Rs. ${Math.round(topCategory[1]).toLocaleString('en-IN')}.`,
    });
  }

  if (current.length > 0) {
    const biggest = current.reduce((a, b) => (a.amount > b.amount ? a : b));
    insights.push({
      type: 'info',
      title: 'Largest single expense',
      message: `Your largest expense was "${biggest.title}" at Rs. ${Math.round(biggest.amount).toLocaleString('en-IN')}.`,
    });
  }

  if (curTotal > 0 && prev.length > 0 && prevTotal > 0) {
    const curAvg = curTotal / current.length;
    const prevAvg = prevTotal / previous.length;
    const diff = ((curAvg - prevAvg) / prevAvg) * 100;
    if (Math.abs(diff) >= 10) {
      insights.push({
        type: diff > 0 ? 'warning' : 'success',
        title: 'Average expense size changed',
        message: `Your average expense per transaction ${diff > 0 ? 'rose' : 'fell'} by ${Math.abs(Math.round(diff))}%.`,
      });
    }
  }

  const order = { warning: 0, success: 1, info: 2 };
  insights.sort((a, b) => order[a.type] - order[b.type]);
  return insights;
};
