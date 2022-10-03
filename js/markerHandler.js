var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {

    if (tableNumber === null) {
      this.askTableNumber();
    }

    //Obtener la colección de platos
    var dishes = await this.getDishes();

    //Evento makerFound
    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });
    //Evento markerLost
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askTableNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "¡¡Bienvenido a 'El antojo'!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Escribe tu número de mesa",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      tableNumber = inputValue;
    });
  },

  handleMarkerFound: function (dishes, markerId) {
    // Obtener el día de hoy
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    // Domingo - Sábado : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];


    //Obtener el plato según el ID
    var dish = dishes.filter(dish => dish.id === markerId)[0];


    //Comprobar si el plato está disponible 
    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "¡¡¡Este plato no está disponible hoy!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      //Cambiar la escala del modelo a la escala inicial
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      //Actualizar la VISIBILIDAD de la interfaz de usuario de la escena AR (MODELO, INGREDIENTES y PRECIO)
      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${dish.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${dish.id}`);
      priceplane.setAttribute("visible", true)

      //Cambiar la visibilidad del botón div
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      if (tableNumber != null) {
        //Manejo de eventos de clic
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Evaluar el platillo",
            text: "Trabajo en proceso"
          });
        });


        orderButtton.addEventListener("click", () => {
          var tNumber;
          tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
          this.handleOrder(tNumber, dish);

          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "¡Gracias por el pedido!",
            text: "¡Su pedido se servirá pronto en su mesa!",
            timer: 2000,
            buttons: false
          });
        });
      }
    }
  },
  handleOrder: function (tNumber, dish) {
    // Leer los detalles del pedido de la mesa actual
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][dish.id]) {
          // Aumentar la cantidad actual
          details["current_orders"][dish.id]["quantity"] += 1;

          // Calculando el subtotal del artículo
          var currentQuantity = details["current_orders"][dish.id]["quantity"];

          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } else {
          details["current_orders"][dish.id] = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1
          };
        }

        details.total_bill += dish.price;

        //Actualizando la db
        firebase
          .firestore()
          .collection("tables")
          .doc(doc.id)
          .update(details);
      });
  },
  //Función para obtener la colección de platillos de la db
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function () {
    //Cambiar la visibilidad del botón div
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
