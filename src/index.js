import "modern-normalize/modern-normalize.css";
import "./style.less";
import axios from "axios";
import moment from "moment";
let getUsers = async () => {
  return await axios
    .get(
      "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users",
      {
        headers: {
          "content-type": "application/json",
        },
      }
    )
    .then((p) => p.data);
};

let getTasks = async () => {
  return await axios
    .get(
      "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks",
      {
        headers: {
          "content-type": "application/json",
        },
      }
    )
    .then((p) => p.data);
};

let fillTasks = async () => {
  //текущая неделя
  let weekStart = moment().clone().startOf("isoWeek");
  //предыдущая неделя
  let prevWeek = moment().subtract(1, "weeks").startOf("isoWeek");
  //следующая неделя
  let nextWeek = moment().add(1, "weeks").startOf("isoWeek");

  let days = [];
  // создание недели
  let createWeek = (week) => {
    days = [];
    for (let i = 0; i <= 6; i++) {
      days.push(moment(week).add(i, "days").format("YYYY-MM-DD"));
    }
  };

  //создание верстки для недели
  let createWeekTemplate = () => {
    document.querySelector(".table-header").insertAdjacentHTML(
      "beforeend",
      `<div class="table-header-item">
        </div>`
    );
    days.forEach((p) => {
      document.querySelector(".table-header").insertAdjacentHTML(
        "beforeend",
        `<div class="table-header-item">
       ${p}
        </div>`
      );
    });
  };
  createWeek(weekStart);
  createWeekTemplate();
  //экшен след. недели
  document.querySelector(".nav-next").addEventListener("click", (e) => {
    clear();
    if (e.currentTarget.parentElement.classList.contains("go")) {
      e.currentTarget.parentElement.classList.remove("go");
      createWeek(weekStart);
    } else {
      e.currentTarget.parentElement.classList.add("go");
      createWeek(nextWeek);
    }
    createWeekTemplate();
    create();
  }); //экшен пред. недели
  document.querySelector(".nav-prev").addEventListener("click", (e) => {
    clear();
    if (e.currentTarget.parentElement.classList.contains("go")) {
      e.currentTarget.parentElement.classList.remove("go");
      createWeek(weekStart);
    } else {
      e.currentTarget.parentElement.classList.add("go");
      createWeek(prevWeek);
    }
    createWeekTemplate();
    create();
  });
  let clear = () => {
    document.querySelectorAll(".task-item").forEach((p) => p.remove());
    document.querySelectorAll(".table-workers-item").forEach((p) => p.remove());
    document.querySelectorAll(".table-header-item").forEach((p) => p.remove());
  };

  let tasks = await getTasks();
  let users = await getUsers();
  console.log(tasks);
  console.log(users);
  let create = () => {
    if (users.length) {
      users.forEach((p) => {
        document.querySelector(".table-workers").insertAdjacentHTML(
          "beforeend",
          `<div class="table-workers-item" id="${p.id}">
        <div class="name date">
     <span>${p.firstName} </span>  
       <span> ${p.surname}  </span>  
       </div>
        </div>`
        );
      });
      days.forEach((p) => {
        document.querySelectorAll(".table-workers-item").forEach((z) => {
          z.insertAdjacentHTML(
            "beforeend",
            `<div class="date" data-today="${p}"></div>`
          );
        });
      });
    }

    if (tasks.length) {
      // заполнение данными
      let NonExecutor = tasks.filter((p) => !p.executor);
      NonExecutor.forEach((p) => {
        document.querySelector(".task-wrapper").insertAdjacentHTML(
          "beforeend",
          `<div class="task-item" data-info="${p.planStartDate}" draggable="true">
        <h5 class="task-item-title">${p.subject}</h5> 
        <div class="task-item-dates">
        <div class="task-item-date start-date">${p.planStartDate}</div>
        <div class="task-item-date end-date">${p.planEndDate}</div>
        </div>
        </div>`
        );
      });
      //Накиюдываю класс на перетаскивыемый элемент
      document.querySelectorAll(".task-item").forEach((p) => {
        p.addEventListener("dragstart", () => {
          p.classList.add("dragging");
        });

        p.addEventListener("dragend", () => {
          p.classList.remove("dragging");
        });
      });
      //вставка в ячейку при перетаскивании в ячейку
      document.querySelectorAll(".table-workers-item .date").forEach((p) => {
        p.addEventListener("dragover", (e) => {
          e.preventDefault();
          const dragable = document.querySelector(".dragging");
          p.appendChild(dragable);
        });
      });

      // Перетаскивание на человека
      document.querySelectorAll(".table-workers-item").forEach((p) => {
        p.querySelector(".name").addEventListener("dragover", (e) => {
          e.preventDefault();
          const dragable = document.querySelector(".dragging");
          console.log(
            e.currentTarget.parentElement.querySelector(
              `[data-today='${dragable.dataset.info}']`
            )
          );

          if (
            e.currentTarget.parentElement.querySelector(
              `[data-today='${dragable.dataset.info}']`
            )
          ) {
            e.currentTarget.parentElement
              .querySelector(`[data-today='${dragable.dataset.info}']`)
              .appendChild(dragable);
          }
        });
      });
      // вставка задач в ячейки если есть исполнитель
      let Executor = tasks.filter((p) => p.executor);
      Executor.forEach((p) => {
        let cell = document
          .getElementById(`${p.executor}`)
          .querySelector(`[data-today='${p.planStartDate}']`);
        if (cell) {
          cell.insertAdjacentHTML(
            "beforeend",
            `<div class="task-item" data-info="${p.planStartDate}" draggable="true">
        <h5 class="task-item-title">${p.subject}</h5> 
        <div class="task-item-dates">
        <div class="task-item-date start-date">${p.planStartDate}</div>
        <div class="task-item-date end-date">${p.planEndDate}</div>
        </div>
        </div>`
          );
        }
        /* console.log(
        document
          .getElementById(`${p.executor}`)
          .querySelector(`[data-today='${p.planStartDate}']`)
      );*/
      });

      /// поиск
      document.querySelector(".task-search").addEventListener("input", (e) => {
        document.querySelectorAll(".task-item").forEach((p) => {
          if (!p.textContent.toLowerCase().includes(e.currentTarget.value)) {
            p.classList.add("collapse");
          } else {
            p.classList.remove("collapse");
          }
        });
      });
    } else {
      document
        .querySelector(".task-wrapper")
        .insertAdjacentHTML(
          "beforeend",
          `<div class="task-item"><h6>Список задач пуст</h6></div>`
        );
    }
  };
  create();
};
fillTasks().then(p=>document.querySelector(".preloader").classList.add("hide")).catch(e=>console.error(e));
