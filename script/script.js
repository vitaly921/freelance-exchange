document.addEventListener('DOMContentLoaded', () => {
  'use strict';




  // Получение элементов страницы
  const customer = document.getElementById('customer'),
        freelancer = document.getElementById('freelancer'),
        blockCustomer = document.querySelector('#block-customer'),
        blockFreelancer = document.querySelector('#block-freelancer'),
        blockChoice = document.querySelector('#block-choice'),
        btnExit = document.getElementById('btn-exit'),
        formCustomer = document.getElementById('form-customer'),
        ordersTable = document.getElementById('orders'),
        modalOrder = document.getElementById('order_read'),
        modalOrderActive = document.getElementById('order_active'),
        headTable = document.getElementById('headTable');

  // Создание массива с заказами
  const orders = JSON.parse(localStorage.getItem('freeOrders')) || [];

  // Функция сохранения заказов в locall storage
  const toStorage = () => {
    localStorage.setItem('freeOrders', JSON.stringify(orders));
  };

  // Функция изменения падежа слова для любого момента времени
  const decOfNum = (number, titles) => 
    number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ?
    2 : [2,0,1,1,1,2][(number % 10 < 5) ? number % 10 : 5]];


  // Функция подсчёта оставшегося времени для раюоты над заказом
  const calcDeadline = (date) =>{
    const deadline = new Date(date);
    const toDay = Date.now();
    //console.log(toDay);

    // Время переводится в формат дней
    const remaining = (deadline - toDay) / 1000 / 60 / 60;

    // Вызов функции изменения падежа слова 
    if (remaining / 24 > 2) {
      return decOfNum(Math.floor(remaining/24), ['день','дня','дней']);  
    }
    
    return decOfNum(Math.floor(remaining), ['час','часа','часов']);
  };



  // Функция вывода списка заказов
  const renderOrders = () => {

    ordersTable.textContent = '';

    orders.forEach((order, i) => {
      console.log(order);
      console.log(i); 
      
      // Динамическое добавление заказов
      // Если заказ активен, к нему добавляется класс и он подсвечивается зелёным цветом
      ordersTable.innerHTML += `
        <tr class="order ${order.active ? 'taken': ''}" data-number-order="${i}">
          <td>${i+1}</td>
          <td>${order.title}</td>
          <td class="${order.currency}"></td>
          <td>${calcDeadline(order.deadline)}</td>
        </tr>`;   
    });
  };
  

  // Функция работы с модальными окнами
  const handlerModal = (event) => {
    // Отлов элемента внутри модального окна, выбранного мышкой
    const target = event.target; 
    const modal = target.closest('.order-modal');
    // Работа с выбранным заказом
    const order = orders[modal.id];

    // Функция закрытия модальных окон, обновления и сохранения списка заказов
    const baseAction = () =>{
      modal.style.display = 'none';
      toStorage();
      renderOrders();
    }

    // Закрытие окон при нажатии на область позади или на символ "Х"
    if (target.closest('.close') || target == modal) {
      modal.style.display = 'none';
    }

    // При нажатии "Взять заказ" заказ активируется
    if (target.classList.contains('get-order')) {
      order.active = true;
      baseAction();
    }

    // Нажатие на кнопку "Отменить" 
    if (target.id === ('capitulation')) {
      order.active = false;
      baseAction();
    }

    // Нажатие на кнопку "Выполнил"
    if (target.id === ('ready')) {
      orders.splice(orders.indexOf(order), 1);
      baseAction();
    }

  }



  // Функция открытия модального окна после выбора заказа
  const openModal = (numberOrder) => {
    //console.log(numberOrder);
    // Берём из массива выбранный заказ
    const order = orders[numberOrder];
    console.log(order);

    //Деструктивное присаивание
    const { title, firstName, email, phone, description, amount, 
        currency, deadline, active = false} = order;

    // Открываем определенный тип модального окна
        const modal = active ? modalOrderActive : modalOrder;


    // Получение элементов модального окна
    const firstNameBlock = modal.querySelector('.firstName'),
          titleBlock = modal.querySelector('.modal-title'),
          emailBlock = modal.querySelector('.email'),
          descriptionBlock = modal.querySelector('.description'),
          deadlineBlock = modal.querySelector('.deadline'),
          currencyBlock = modal.querySelector('.currency_img'),
          countBlock = modal.querySelector('.count'),
          phoneBlock = modal.querySelector('.phone');

          // Модальное окно имеет свой id - номер заказа
          modal.id = numberOrder;

          // Изменение контента модального окна согласно заказу
          titleBlock.textContent = title;
          firstNameBlock.textContent = firstName;
          emailBlock.textContent = email;
          emailBlock.href = 'mailto:' + email;
          descriptionBlock.textContent = description;
          deadlineBlock.textContent = calcDeadline(deadline);
          currencyBlock.className = 'currency_img';
          currencyBlock.classList.add(currency);
          countBlock.textContent = amount;
          phoneBlock && (phoneBlock.href = 'tel:' + phone);

          // Располагаем окно посередине экрана
          modal.style.display = 'flex';

          // Нажатие различных кнопок внутри окна реализовано в отдельной функции
          modal.addEventListener('click', handlerModal);
    };



    const sortOrder = (arr, property) => {
      arr.sort((a, b) => a[property] > b[property] ? 1: -1);
    }



 // Обработчики событий

    headTable.addEventListener('click', (event) => {
      const target = event.target;

      if (target.classList.contains('head-sort')) {
        if(target.id === 'taskSort'){
          sortOrder(orders, 'title');
        }

        if(target.id === 'currencySort'){
          sortOrder(orders, 'currency');
        }

        if(target.id === 'deadlineSort'){
          sortOrder(orders, 'dedline');
        }

        renderOrders();
        toStorage();
      }

    });

 // Обращение к части таблицы, заполненной заказами
  ordersTable.addEventListener('click', event => {
    // Выбор конкретной ячейки в таблице заказоа
    const target = event.target;
    console.log(target);
    // Выбор целой строки заказа на основе выбранной ячейки 
    //(поднимается по верстке до выбранного класса)
    const targetOrder = target.closest('.order');
    console.log(targetOrder);

    // Если выбранная строка заказа существует, то вызываем функцию,
    // которая откроет модальное окно
    if (targetOrder){
      openModal(targetOrder.dataset.numberOrder);
    }

    //Вывод конкретного заказа
    //console.log(orders[targetOrder.dataset.numberOrder]);


  });

  // Нажатие на кнопку "Заказчик"
  customer.addEventListener('click', () => {
    blockChoice.style.display = 'none';                     //Скрытие родительского блока при нажатии
    const toDay = new Date().toISOString().substring(0,10);
    document.getElementById('deadline').min = toDay;        //Минимальный срок сдачи - сегодня
    blockCustomer.style.display = 'block';                  //Отображение дочернего блока при нажатии
    btnExit.style.display = 'block';                        //Отображение кнопки Выход
  });

  // Нажатие на кнопку "Фрилансер"
  freelancer.addEventListener('click', () => {
    blockChoice.style.display = 'none';                     //Скрытие родительского блока при нажатии
    renderOrders();                                         //Вывод каждого заказа на экран
    blockFreelancer.style.display = 'block';                //Отображение дочернего блока при нажатии
    btnExit.style.display = 'block';                        //Отображение кнопки Выход
  });

  // Нажатие на кнопку "Выход"
  btnExit.addEventListener('click', () => {
    btnExit.style.display = 'none';                         //Кнопка Выход скрывается
    blockFreelancer.style.display = 'none';                 //Страница для фрилансера скрывается
    blockCustomer.style.display = 'none';                   //Страница для заказчика скрывается
    blockChoice.style.display = 'block';                    //Главная станица отображается
  })

  // Нажатие на кнопку "Отправить заявку"
  formCustomer.addEventListener('submit', event => {
    event.preventDefault();                                 // Отключение обновления страницы
    const obj = {};                                         // Создание объекта с введёнными в формы данными


    //Создание массива с нужными формами 
    const elements = [...formCustomer.elements]             //Разбивание массивоподных объектов на единичные элементы
    .filter(elem => (elem.tagName === "INPUT" && elem.type !== 'radio' ||
           elem.type === 'radio' && elem.checked ||
           elem.tagName === 'TEXTAREA'))   
    
    //console.log(elements);

    //Перебираем массив, берем значения у форм и добавляем в объект 
    elements.forEach(elem => {
      obj[elem.name] = elem.value;
      //console.log(elem);
    });

    //console.log(obj);

    //Сброс в формах до значений по умолчанию. Задаётся в HTML в value
    formCustomer.reset();

    // Добавляем объект в массив
    orders.push(obj);
    // Сохранение в localstorage
    toStorage();
    console.log(orders);
  });

})