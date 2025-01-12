import { AdjustmentTransactions } from '@/components/adjustment-transactions';

const TransactionsPage = () => {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold my-4 text-center">
        Adjustment Transactions
      </h1>
      <AdjustmentTransactions />
    </div>
  );
};

export default TransactionsPage;
