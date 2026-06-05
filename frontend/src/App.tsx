import React, { useState } from 'react';
import TransactionForm from './components/transaction/TransactionForm';
import TransactionList from './components/transaction/TransactionList';
import MonthlySummary from './components/budget/MonthlySummary';
import BudgetManager from './components/budget/BudgetManager';
import { Transaction, NewTransaction } from './types/transaction';

// 현재 연-월을 'YYYY-MM' 형식으로 반환
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// 선택 월의 총 지출액을 계산
function calcMonthlyExpense(transactions: Transaction[], month: string): number {
  return transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

let nextId = 1;

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const currentMonth = getCurrentMonth();

  const handleSubmit = (newTx: NewTransaction) => {
    setTransactions(prev => [...prev, { ...newTx, id: String(nextId++) }]);
  };

  const totalSpent = calcMonthlyExpense(transactions, currentMonth);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 24 }}>가계부</h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>내역 입력</h2>
        <TransactionForm onSubmit={handleSubmit} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <MonthlySummary transactions={transactions} defaultMonth={currentMonth} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <BudgetManager totalSpent={totalSpent} month={currentMonth} />
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>내역 목록</h2>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
};

export default App;
