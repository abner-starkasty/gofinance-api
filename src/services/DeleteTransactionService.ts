import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionFound = await transactionsRepository.findOne(id);

    if (!transactionFound) {
      throw new AppError('Transaction not found!');
    }

    await transactionsRepository.remove(transactionFound);
  }
}

export default DeleteTransactionService;
