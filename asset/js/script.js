document.addEventListener("DOMContentLoaded", function() {
    const formularioVenta = document.getElementById("formulario-venta");
    const listarClientesBtn = document.getElementById("listar-clientes");
    const borrarDatosBtn = document.getElementById("borrar-datos");

    // Configuración de Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBx8K1cmc9jzX-r8BD9mEt-HJxAky-NpXU",
        authDomain: "registro-de-ventas-ed4c2.firebaseapp.com",
        projectId: "registro-de-ventas-ed4c2",
        storageBucket: "registro-de-ventas-ed4c2.appspot.com",
        messagingSenderId: "1022580416333",
        appId: "1:1022580416333:web:ae0f0667e1f16e5b202104"
    };

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const ventasRef = database.ref("ventas");

    // Función para guardar una venta en la base de datos
    formularioVenta.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const nombreCliente = document.getElementById("nombre-cliente").value;
        const fecha = document.getElementById("fecha").value;

        // Guardar la venta en la base de datos
        ventasRef.push({ nombreCliente, fecha });

        formularioVenta.reset();
    });

    // Función para listar clientes
    function listarClientes() {
        ventasRef.on("value", function(snapshot) { // Cambiar .once por .on
            const ventas = snapshot.val();
            const tablaBody = document.getElementById("tabla-body");
            tablaBody.innerHTML = ""; // Limpiar contenido previo de la tabla
            
            if (!ventas) {
                alert("No hay clientes registrados.");
                return;
            }

            Object.values(ventas).forEach(function(venta) {
                const row = document.createElement("tr");
                const nombreCell = document.createElement("td");
                nombreCell.textContent = venta.nombreCliente;
                row.appendChild(nombreCell);

                const proximaCompraCell = document.createElement("td");
                proximaCompraCell.textContent = new Date(venta.fecha).toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' });
                row.appendChild(proximaCompraCell);

                const diasRestantesCell = document.createElement("td");
                const diasRestantes = calcularDiasRestantes(new Date(venta.fecha));
                diasRestantesCell.textContent = diasRestantes + " días"; // Mostrar los días restantes
                row.appendChild(diasRestantesCell);

                tablaBody.appendChild(row);
            });
        });
    }


    function calcularClientesProximos(ventas) {
        const clientes = {};
    
        // Calcular la fecha promedio de compra para cada cliente
        ventas.forEach(function(venta) {
            if (!(venta.nombreCliente in clientes)) {
                clientes[venta.nombreCliente] = { fechas: [], proximaCompra: null };
            }
            clientes[venta.nombreCliente].fechas.push(new Date(venta.fecha));
        });
    
        Object.keys(clientes).forEach(function(cliente) {
            const fechas = clientes[cliente].fechas;
    
            if (fechas.length > 1) { // Verificar si el cliente ha realizado al menos dos compras
                // Calcular la suma de los intervalos entre las compras
                let sumaIntervalos = 0;
                for (let i = 1; i < fechas.length; i++) {
                    const intervalo = fechas[i].getTime() - fechas[i - 1].getTime();
                    sumaIntervalos += intervalo;
                }
    
                // Calcular el intervalo promedio y la próxima compra aproximada
                const intervaloPromedio = sumaIntervalos / (fechas.length - 1);
                const ultimaCompra = fechas[fechas.length - 1];
                const proximaCompra = new Date(ultimaCompra.getTime() + intervaloPromedio);
    
                // Calcular los días restantes hasta la próxima compra
                const hoy = new Date();
                const diasRestantes = Math.ceil((proximaCompra - hoy) / (1000 * 60 * 60 * 24));
    
                // Almacenar el nombre del cliente, la próxima compra y los días restantes
                clientes[cliente].nombreCliente = cliente;
                clientes[cliente].proximaCompra = proximaCompra;
                clientes[cliente].diasRestantes = diasRestantes;
            }
        });
    
        // Filtrar y ordenar los clientes por su próxima compra
        const clientesProximos = Object.values(clientes).filter(cliente => cliente.proximaCompra !== null);
        const clientesOrdenados = clientesProximos.sort(function(a, b) {
            return a.proximaCompra - b.proximaCompra;
        });
    
        return clientesOrdenados;
    }
    function calcularProximaCompra(cliente, ventas) {
        // Filtrar las ventas del cliente
        const ventasCliente = ventas.filter(venta => venta.nombreCliente === cliente);
    
        // Si el cliente no tiene ventas registradas, retornar mensaje
        if (ventasCliente.length === 0) {
            return "No hay compras registradas para este cliente.";
        }
    
        // Calcular el intervalo de tiempo entre las compras
        const intervalos = [];
        for (let i = 1; i < ventasCliente.length; i++) {
            const fechaActual = new Date(ventasCliente[i].fecha);
            const fechaAnterior = new Date(ventasCliente[i - 1].fecha);
            const intervalo = fechaActual.getTime() - fechaAnterior.getTime();
            intervalos.push(intervalo);
        }
    
        // Calcular el promedio de los intervalos
        const promedioIntervalos = intervalos.reduce((acc, curr) => acc + curr, 0) / intervalos.length;
    
        // Calcular la próxima compra
        const ultimaCompra = new Date(ventasCliente[ventasCliente.length - 1].fecha);
        const proximaCompra = new Date(ultimaCompra.getTime() + promedioIntervalos);
    
        return proximaCompra.toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' });
    } 

    // Agregar event listener al botón "Listar Clientes"
    listarClientesBtn.addEventListener("click", listarClientes);

    // Botón para borrar todos los datos
    borrarDatosBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas borrar todos los datos?')) {
            // Borra los datos de Firebase
            ventasRef.remove()
                .then(function() {
                    console.log('Se han borrado todos los datos correctamente.');
                })
                .catch(function(error) {
                    console.error('Error al borrar los datos:', error);
                });
        }
    });

    // Función para calcular los días restantes hasta la próxima compra
    function calcularDiasRestantes(proximaCompra) {
        const hoy = new Date();
        const diferenciaTiempo = proximaCompra.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
        return diasRestantes;
    }    
});
