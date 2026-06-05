import React, { useState } from 'react';
import { NewTransaction, TransactionType, getCategories } from '../../types/transaction';
import {
  TransactionFormErrors,
  validateTransactionForm,
  toNewTransaction,
} from '../../utils/transactionValidation';
import './TransactionForm.css';

interface TransactionFormState {
  type: TransactionType;
  date: string;
  amount: string;
  category: string;
  memo: string;
}

interface TransactionFormProps {
  // 저장 버튼 클릭 시 추가된 내역을 전달받는 콜백
  onSubmit: (transaction: NewTransaction) => void;
  // 폼 초기값 (선택)
  initialType?: TransactionType;
}

const createInitialState = (type: TransactionType): TransactionFormState => ({
  type,
  date: '',
  amount: '',
  category: '',
  memo: '',
});

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialType = 'expense',
}) => {
  const [formData, setFormData] = useState<TransactionFormState>(
    createInitialState(initialType),
  );
  const [errors, setErrors] = useState<TransactionFormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 초기화
    if (errors[name as keyof TransactionFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // 수입/지출 유형 변경 시 카테고리는 초기화 (유형별 목록이 다르기 때문)
  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({ ...prev, type, category: '' }));
    setErrors(prev => ({ ...prev, category: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateTransactionForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(toNewTransaction(formData));
    // 저장 후 폼 초기화 (유형은 유지)
    setFormData(createInitialState(formData.type));
    setErrors({});
  };

  const categories = getCategories(formData.type);

  return (
    <div className="transaction-form-container">
      <form className="transaction-form" onSubmit={handleSubmit} noValidate>
        {/* 수입/지출 유형 선택 */}
        <div className="form-group">
          <span className="form-label">유형</span>
          <div className="type-toggle" role="group" aria-label="수입/지출 유형">
            <button
              type="button"
              className={`type-button ${formData.type === 'income' ? 'type-button--active' : ''}`}
              aria-pressed={formData.type === 'income'}
              onClick={() => handleTypeChange('income')}
            >
              수입
            </button>
            <button
              type="button"
              className={`type-button ${formData.type === 'expense' ? 'type-button--active' : ''}`}
              aria-pressed={formData.type === 'expense'}
              onClick={() => handleTypeChange('expense')}
            >
              지출
            </button>
          </div>
        </div>

        {/* 날짜 입력 필드 */}
        <div className="form-group">
          <label htmlFor="date" className="form-label">
            날짜
          </label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-input ${errors.date ? 'form-input--error' : ''}`}
          />
          {errors.date && (
            <span className="error-message" role="alert">
              {errors.date}
            </span>
          )}
        </div>

        {/* 금액 입력 필드 */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            금액
          </label>
          <input
            id="amount"
            type="number"
            name="amount"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            className={`form-input ${errors.amount ? 'form-input--error' : ''}`}
            placeholder="금액을 입력하세요"
          />
          {errors.amount && (
            <span className="error-message" role="alert">
              {errors.amount}
            </span>
          )}
        </div>

        {/* 카테고리 선택 필드 */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-input ${errors.category ? 'form-input--error' : ''}`}
          >
            <option value="">카테고리 선택</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="error-message" role="alert">
              {errors.category}
            </span>
          )}
        </div>

        {/* 메모 입력 필드 (선택) */}
        <div className="form-group">
          <label htmlFor="memo" className="form-label">
            메모
          </label>
          <textarea
            id="memo"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            className="form-input"
            placeholder="메모를 입력하세요 (선택)"
            rows={2}
          />
        </div>

        {/* 저장 버튼 */}
        <button type="submit" className="submit-button">
          저장
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
