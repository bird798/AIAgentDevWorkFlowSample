import React, { useState } from 'react';
import TransactionForm from './components/transaction/TransactionForm';
import TransactionList from './components/transaction/TransactionList';
import MonthlySummary from './components/budget/MonthlySummary';
import BudgetManager from './components/budget/BudgetManager';
import { Button } from './components/Button';
import { Transaction, NewTransaction } from './types/transaction';

// 예산이 저장되는 localStorage 키 접두사 (BudgetManager 와 동일)
const BUDGET_KEY_PREFIX = 'budget:';

// 초기화 확인 다이얼로그에 표시할 메시지
const RESET_CONFIRM_MESSAGE = '모든 내역을 삭제하시겠습니까?';

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

// localStorage 에 저장된 예산(budget:) 키를 모두 삭제
function clearStoredBudgets(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(BUDGET_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
}

let nextId = 1;

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // 초기화 시 BudgetManager 를 강제로 다시 마운트해 빈 상태로 갱신하기 위한 값
  const [resetNonce, setResetNonce] = useState(0);
  const currentMonth = getCurrentMonth();

  const handleSubmit = (newTx: NewTransaction) => {
    setTransactions(prev => [...prev, { ...newTx, id: String(nextId++) }]);
  };

  // 모든 거래 내역과 저장된 예산을 초기 상태로 되돌린다
  const handleReset = () => {
    setTransactions([]);
    clearStoredBudgets();
    // key 변경으로 BudgetManager 를 재마운트해 비워진 예산을 반영
    setResetNonce(prev => prev + 1);
  };

  // 초기화 버튼 클릭 시 확인을 받고, 확인한 경우에만 초기화를 실행
  const handleResetClick = () => {
    if (window.confirm(RESET_CONFIRM_MESSAGE)) {
      handleReset();
    }
  };

  const totalSpent = calcMonthlyExpense(transactions, currentMonth);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>부자되고 싶어요</h1>
        <Button onClick={handleResetClick}>초기화</Button>
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>내역 입력</h2>
        <TransactionForm onSubmit={handleSubmit} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <MonthlySummary transactions={transactions} defaultMonth={currentMonth} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <BudgetManager key={resetNonce} totalSpent={totalSpent} month={currentMonth} />
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>내역 목록</h2>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
};

export default App;
