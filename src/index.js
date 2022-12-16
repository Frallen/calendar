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
  let currentDate = moment();

  let weekStart = currentDate.clone().startOf("isoWeek");
  //var weekEnd = currentDate.clone().endOf('isoWeek');

  let days = [];

  for (let i = 0; i <= 6; i++) {
    days.push(moment(weekStart).add(i, "days").format("DD"));
  }
  console.log(days);
  days.forEach((p) => {
    document.querySelector(".table-header").insertAdjacentHTML(
      "beforeend",
      `<div class="table-header-item">
       ${p}
        </div>`
    );
  });

  let tasks = await getTasks();
  let users = await getUsers();
  console.log(tasks);
  console.log(users);
  let count = 7 * users.length - 1;

  /* for (let i = 0; i <= count; i++) {
    document.querySelector(".table-body").insertAdjacentHTML(
      "beforeend",
      `<div class="table-body-item">
        </div>`
    );
  }*/
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
      document.querySelectorAll(".table-workers-item").forEach(z=>
      {z.
        insertAdjacentHTML(
            "beforeend",
            `<div class="date" data-today=" ${p}">
      
        </div>`
        )
      })
    });
  }

  if (tasks.length) {
    // заполнение данными
    let executor = tasks.filter((p) => !p.executor);
    executor.forEach((p) => {
      document.querySelector(".task-wrapper").insertAdjacentHTML(
        "beforeend",
        `<div class="task-item" data-id="${p.executor}" draggable="true">
        <h5 class="task-item-title">${p.subject}</h5> 
        <div class="task-item-dates">
        <div class="task-item-date start-date">${p.planStartDate}</div>
        <div class="task-item-date end-date">${p.planEndDate}</div>
        </div>
        </div>`
      );
    });
    document.querySelectorAll(".task-item").forEach((p) => {
      p.addEventListener("dragstart", () => {
        p.classList.add("dragging");
      });

      p.addEventListener("dragend", () => {
        p.classList.remove("dragging");
      });
    });
    document.querySelectorAll(".table-workers-item .date").forEach((p) => {
      p.addEventListener("dragover", (e) => {
        e.preventDefault();
        const dragable = document.querySelector(".dragging");
        p.appendChild(dragable);
      });
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
fillTasks();
