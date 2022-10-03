AFRAME.registerComponent("create-buttons", {
  init: function() {
    // 1. Crear el botón
    var button1 = document.createElement("button");
    button1.innerHTML = "RATE DISH";
    button1.setAttribute("id", "rating-button");
    button1.setAttribute("class", "btn btn-warning mr-3");

    // 2. Crear el botón
    var button2 = document.createElement("button");
    button2.innerHTML = "ORDER NOW";
    button2.setAttribute("id", "order-button");
    button2.setAttribute("class", "btn btn-warning mr-4");

    // 2. Anexar en algún lugar
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.appendChild(button1);
    buttonDiv.appendChild(button2);
  }
});
