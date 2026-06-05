import React, { useState } from 'react';
import TransactionForm from './components/transaction/TransactionForm';
import TransactionList from './components/transaction/TransactionList';
import MonthlySummary from './components/budget/MonthlySummary';
import BudgetManager from './components/budget/BudgetManager';
import { Button } from './components/Button';
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

  // 초기화 버튼 클릭 핸들러 (실제 동작은 후속 Sub-issue에서 연결)
  const handleReset = () => {
    // placeholder: 클릭 동작은 아직 연결되지 않음
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <header
        aria-label="앱 헤더"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>가계부</h1>
        <Button onClick={handleReset}>초기화</Button>
      </header>

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
