import React, { useState } from 'react';
import TransactionForm from './components/transaction/TransactionForm';
import TransactionList from './components/transaction/TransactionList';
import MonthlySummary from './components/budget/MonthlySummary';
import BudgetManager from './components/budget/BudgetManager';
import { Button } from './components/Button';
import { Transaction, NewTransaction } from './types/transaction';

// BudgetManager 가 localStorage 에 예산을 저장할 때 사용하는 키 접두사
const BUDGET_KEY_PREFIX = 'budget:';

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

// localStorage 에서 'budget:' 접두사를 가진 모든 예산 키를 삭제
function clearBudgetStorage(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null && key.startsWith(BUDGET_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

let nextId = 1;

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // 초기화 시 값을 증가시켜 BudgetManager 를 강제로 다시 마운트(예산 현황 갱신)
  const [resetKey, setResetKey] = useState(0);
  const currentMonth = getCurrentMonth();

  const handleSubmit = (newTx: NewTransaction) => {
    setTransactions(prev => [...prev, { ...newTx, id: String(nextId++) }]);
  };

  // 화면 초기화: 거래 내역 state 와 저장된 예산 데이터를 모두 비운다
  const handleReset = () => {
    setTransactions([]);
    clearBudgetStorage();
    setResetKey(prev => prev + 1);
  };

  const totalSpent = calcMonthlyExpense(transactions, currentMonth);

  // 초기화 버튼 클릭 핸들러 (실제 동작은 후속 Sub-issue에서 연결)
  const handleReset = () => {
    // placeholder: 클릭 동작은 아직 연결되지 않음
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>가계부</h1>
        <button type="button" onClick={handleReset}>
          초기화
        </button>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>내역 입력</h2>
        <TransactionForm onSubmit={handleSubmit} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <MonthlySummary transactions={transactions} defaultMonth={currentMonth} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <BudgetManager key={resetKey} totalSpent={totalSpent} month={currentMonth} />
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>내역 목록</h2>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
};

export default App;
