import { createContext, useEffect, useMemo, useState } from "react";

export const GlobalContext = createContext(null);
const STORAGE_KEY = "money-manager-transactions";

export default function GlobalState({ children }) {
  const [allTransactions, setAllTransactions] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allTransactions));
  }, [allTransactions]);

  const { totalIncome, totalExpense } = useMemo(
    () =>
      allTransactions.reduce(
        (totals, transaction) => {
          const amount = Number(transaction.amount) || 0;
          if (transaction.type === "income") totals.totalIncome += amount;
          else totals.totalExpense += amount;
          return totals;
        },
        { totalIncome: 0, totalExpense: 0 }
      ),
    [allTransactions]
  );

  function handleFormSubmit(transaction) {
    const amount = Number(transaction.amount);
    const description = transaction.description.trim();
    if (!description || !Number.isFinite(amount) || amount <= 0) return false;

    setAllTransactions((current) => [
      { ...transaction, amount, description, date: new Date().toISOString(), id: `${Date.now()}-${Math.random()}` },
      ...current,
    ]);
    return true;
  }

  function updateTransaction(id, transaction) {
    const amount = Number(transaction.amount);
    const description = transaction.description.trim();
    if (!description || !Number.isFinite(amount) || amount <= 0) return false;
    setAllTransactions((current) => current.map((item) => item.id === id
      ? { ...item, ...transaction, amount, description }
      : item));
    return true;
  }

  function importTransactions(transactions) {
    setAllTransactions((current) => [...transactions, ...current]);
  }

  function deleteTransaction(id) {
    setAllTransactions((current) => current.filter((item) => item.id !== id));
  }

  return (
    <GlobalContext.Provider
      value={{ allTransactions, totalIncome, totalExpense, handleFormSubmit, updateTransaction, importTransactions, deleteTransaction }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
