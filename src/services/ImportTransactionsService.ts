import { getCustomRepository, getRepository, In } from 'typeorm';
import fs from 'fs';
import Transaction from '../models/Transaction';
import loadCSV from '../config/csvImport';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  filePath: string;
}

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const data: CSVTransaction[] = await loadCSV(filePath);
    console.log(data);

    const categoriesOnCsv = data.map(item => item.category);

    const existentCategoriesOnDb = await categoriesRepository.find({
      where: {
        title: In(categoriesOnCsv),
      },
    });

    const existentCategoriesTitles = existentCategoriesOnDb.map(
      (category: Category) => category.title,
    );

    const categoryTitleToSave = categoriesOnCsv
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      categoryTitleToSave.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategoriesOnDb];

    const createdTransactions = transactionsRepository.create(
      data.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
