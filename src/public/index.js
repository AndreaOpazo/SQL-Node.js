const socket = io();

socket.on("productList", (data) => {
  const template = Handlebars.compile(`
    {{#if data}}
      <div class="table-responsive container">
        <table class="table table-dark table-sm text-center">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Precio</th>
              <th scope="col">Foto</th>
            </tr>
          </thead>
          <tbody>
              {{#each data}}
                <tr>
                  <td scope="row">{{this.title}}</td>
                  <td>{{this.price}}</td>
                  <td>
                    <img src={{this.thumbnail}} width="50rem">
                  </td>
                </tr>
              {{/each}}
          </tbody>
        </table>
      </div>
    {{else}}
      <div class="alert alert-danger container" role="alert">
        No hay productos!
      </div>
    {{/if}}
  `);
  document.getElementById("table").innerHTML = template({ data });
});

const formIsValid = () => {
  const emailUser = document.getElementById("email-user").value;
  const text = document.getElementById("text").value;
  return emailUser.trim() !== "" && text.trim() !== ""
};

document.querySelector("#submit").addEventListener("click", (e) => {
  e.preventDefault();
  sendMessage()
})

const getActualDate = () => {
  const date = new Date();

  let day = date.getDate();
  if (day < 10) day = `0${day}`;

  let month = date.getMonth() + 1;
  if (month < 10) month = `0${month}`;

  const year = date.getFullYear();

  let hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
  let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  let seconds = (date.getSeconds() < 10 ? '0' : '' ) + date.getSeconds();
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const sendMessage = () => {
  if (!formIsValid()) {
    alert("Email y/o mensaje requerido");
    return;
  }
  socket.emit("new-message", { 
    emailUser: document.getElementById("email-user").value,
    text: document.getElementById("text").value,
    date: getActualDate()
  });
  return false;
};

socket.on("messageList", (data) => {
  document.getElementById("msg-core").innerHTML = data
    .map(({emailUser, text, date}) => `
      <div>
        <b style="color: blue;">${emailUser}</b>
        <span style="color: brown;">[${date}]<i style="color: green;"> : ${text}</i></span>
      </div>`
    )
    .join(" ");
  clearInputs();
});

const clearInputs = () => {
  document.getElementById("email-user").value = "";
  document.getElementById("text").value = "";
};