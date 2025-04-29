const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());

// Загрузка данных из файла
const loadData = () => {
    const data = fs.readFileSync('data.json');
    return JSON.parse(data);
};

// Сохранение данных в файл
const saveData = (data) => {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
};

// Эндпоинт для добавления транзакции
app.post('/api/transactions', (req, res) => {
    const { id, type, category, amount, date } = req.body;
    const data = loadData();

    // Добавляем транзакцию
    data.transactions.push({ id, type, category, amount, date });

    // Обновляем статистику
    if (type === 'income') {
        data.stats.income += amount;
    } else {
        data.stats.expenses += amount;
    }

    saveData(data);
    res.status(201).send({ message: 'Транзакция добавлена' });
});

// Эндпоинт для получения статистики
app.get('/api/stats', (req, res) => {
    const data = loadData();
    res.send(data.stats);
});

// Эндпоинт для получения всех транзакций
app.get('/api/transactions', (req, res) => {
    const data = loadData();
    res.send(data.transactions);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Эндпоинт для управления категориями
app.get('/api/categories', (req, res) => {
    const categories = loadData('datalist.json');
    res.send(categories);
});

app.post('/api/categories', (req, res) => {
    const { category } = req.body;
    const categories = loadData('datalist.json');
    
    if (!categories.includes(category)) {
        categories.push(category);
        saveData('datalist.json', categories);
    }

    res.status(201).send({ message: 'Категория добавлена' });
});

// Эндпоинт для удаления транзакции
app.delete('/api/transactions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = loadData();

    // Находим индекс транзакции с заданным ID
    const index = data.transactions.findIndex(transaction => transaction.id === id);
  
    if (index !== -1) {
        // Если транзакция найдена, удаляем ее
        const [deletedTransaction] = data.transactions.splice(index, 1);

        // Обновляем статистику
        if (deletedTransaction.type === 'income') {
            data.stats.income -= deletedTransaction.amount;
        } else {
            data.stats.expenses -= deletedTransaction.amount;
        }

        saveData(data);
        res.status(200).send({ message: 'Транзакция удалена' });
    } else {
        res.status(404).send({ message: 'Транзакция не найдена' });
    }
});


