// src/index.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs,  query, where, orderBy, limit } from "firebase/firestore";
import './style.css';
import './qrcode.js';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const firebaseConfig = {
  apiKey: "AIzaSyAd4-LlGsIDg3MrGNiQwGwH9ZuYe-rqpoU",
  authDomain: "charlyticket-12c27.firebaseapp.com",
  projectId: "charlyticket-12c27",
  storageBucket: "charlyticket-12c27.appspot.com",
  messagingSenderId: "539395668161",
  appId: "1:539395668161:web:0d9137ea5f3d8e10acbc40",
  measurementId: "G-942R2Y5F7G"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

function generateTickets() {
  window.location.href = "page_formulaire.html";
}

function showHistory() {
  window.location.href = "page_historique.html";
}


if (window.location.pathname.endsWith('page_formulaire.html')) {
    const beforeUnloadHandler = function (e) {
        // Annuler l'événement par défaut
        e.preventDefault();
        // Chrome requiert également returnValue à être défini
        e.returnValue = '';
    };

    // Ajoutez l'écouteur d'événement 'beforeunload'
    window.addEventListener('beforeunload', beforeUnloadHandler);

    document.addEventListener('DOMContentLoaded', () => {
        setNextTicketId();
        resetFormFields();
        const validateButton = document.getElementById('validateButton');
        if (validateButton) {
            validateButton.addEventListener('click', function () {
                // Supprimez l'écouteur 'beforeunload' lorsque le bouton est cliqué
                window.removeEventListener('beforeunload', beforeUnloadHandler);
                // Exécutez la fonction generateQRCode
                generateQRCode();
            });
        } else {
            console.error("L'élément 'validateButton' n'existe pas !");
        }
    });
}
function setNextTicketId() {
    const db = getFirestore(app);
    const ticketsRef = collection(db, "tickets");
    const queryLastTicket = query(ticketsRef, orderBy("ticketId", "desc"), limit(1));

    getDocs(queryLastTicket)
    .then((querySnapshot) => {
        let nextTicketId = "U24/01"; // Commencez par "U24/01" si aucune entrée n'est trouvée

        if (!querySnapshot.empty) {
            // Récupérer le dernier ticketId et incrémenter la partie représentant le numéro du ticket
            const lastTicket = querySnapshot.docs[0].data();
            const lastTicketId = lastTicket.ticketId;
            const lastTicketNumber = Number(lastTicketId.split("/")[1]); // Extraire le numéro du ticket et convertir en nombre
            const nextTicketNumber = lastTicketNumber + 1;
            nextTicketId = "U24/" + String(nextTicketNumber).padStart(2, "0"); // Formatage du prochain ticketId
        }

        // Remplir le champ ticketId avec le prochain numéro
        const ticketIdField = document.getElementById('ticketId');
        ticketIdField.value = nextTicketId;

        // Rendre le champ non modifiable
        ticketIdField.setAttribute('readonly', true);
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération du dernier ticketId : ", error);
    });
}
function resetFormFields() {
    document.getElementById('ticketId').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('phoneNumber').value = '229';
    document.getElementById('gender').selectedIndex = 0; // pour sélectionner la première option du select
}
    function generateQRCode() {
        // Votre logique pour générer le code QR
    
        var ticketId = document.getElementById("ticketId").value;
        var firstName = document.getElementById("firstName").value;
        var phoneNumber = document.getElementById("phoneNumber").value;
        var gender = document.getElementById("gender").value;
    
        if (!ticketId || !firstName || !phoneNumber || !gender) {
            alert("Veuillez remplir tous les champs du formulaire.");
            return;
        }
    
        var qrCodeContent = ticketId + "-" + firstName + "-" + phoneNumber + "-" + gender;
    
        try {
            // Assurez-vous que 'qrCode' est bien l'ID de votre élément HTML destiné à afficher le QR code
            var qrCodeContainer = document.getElementById('qrCode');
    
            // Effacer le contenu précédent
            qrCodeContainer.innerHTML = '';
    
            // Générer le code QR et l'ajouter à l'élément container
            QRCode.toDataURL(qrCodeContent, function (err, url) {
                if (err) {
                    throw err;
                }
                var img = document.createElement('img');
                img.src = url;
               
            });
        } catch (error) {
            console.error("Erreur lors de la génération du code QR : ", error);
            alert("Une erreur est survenue lors de la génération du code QR. Veuillez réessayer.");
            return;
        }
    
        // Supposons que saveTicketInfo est une fonction définie ailleurs pour enregistrer les informations du ticket
        saveTicketInfo(ticketId, firstName, phoneNumber, gender);
    }

    function saveTicketInfo(ticketId, firstName, phoneNumber, gender) {
        const db = getFirestore(app);
        const ticketsRef = collection(db, "tickets");
        
        // Créer une requête pour rechercher un ticket existant avec les mêmes informations
        const queryTicket = query(ticketsRef, where("firstName", "==", firstName), where("phoneNumber", "==", phoneNumber), where("gender", "==", gender));
        
        // Exécuter la requête
        getDocs(queryTicket)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                // Un ou plusieurs documents existent déjà avec ces informations
                alert("Ticket déjà existant");
            } else {
                // Aucun document existant, procéder à l'ajout
                addDoc(ticketsRef, {
                    ticketId: ticketId,
                    firstName: firstName,
                    phoneNumber: phoneNumber,
                    gender: gender
                })
                .then((docRef) => {
                    console.log("Document written with ID: ", docRef.id);
                    window.location.href = "page_tickets.html?id=" + ticketId + "&firstName=" + firstName + "&phoneNumber=" + phoneNumber + "&gender=" + gender;
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    alert("Une erreur s'est produite lors de l'enregistrement du ticket. Veuillez réessayer plus tard.");
                });
            }
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
    }

document.addEventListener('DOMContentLoaded', () => {
    // Vérifiez si l'URL de la page est celle de la page page_tickets.html
    if (window.location.pathname.endsWith('page_tickets.html')) {
        var urlParams = new URLSearchParams(window.location.search);
        var ticketId = urlParams.get("id");
        var firstName = urlParams.get("firstName");
        var phoneNumber = urlParams.get("phoneNumber");
        var gender = urlParams.get("gender");
    
        if (!ticketId || !firstName || !phoneNumber || !gender) {
            window.location.href = "page_formulaire.html";
        } else {
            generateTicket(ticketId, firstName, phoneNumber, gender);
        }
    }
});

   //Modifiez la fonction generateTicket pour attendre que l'image du ticket soit chargée
function generateTicket(ticketId, firstName, phoneNumber, gender) {
    var qrCodeContent = ticketId + "-" + firstName + "-" + phoneNumber + "-" + gender;
    var ticketImage = document.querySelector(".ticket-image");
    var qrCodeContainer = document.getElementById("qrCode");

    var generateQRCode = function(size) {
        QRCode.toDataURL(qrCodeContent, {
            width: size,
            height: size,
            format: "svg",
            Text: qrCodeContent,
            colorDark: "#000000",
            colorLight: "#ffffff",
            margin: 0.5,
            errorCorrectionLevel: 'H' // Niveau de correction d'erreur
        }, function (err, url) {
            if (err) {
                console.error("Erreur lors de la génération du code QR : ", err);
                alert("Une erreur est survenue lors de la génération du code QR. Veuillez réessayer.");
            } else {
                // Créer un nouvel élément img pour le QR code
                var qrCodeImage = new Image();
                qrCodeImage.src = url;
                qrCodeImage.alt = "QR Code";
                qrCodeImage.width = size;
                qrCodeImage.height = size;

                // Nettoyer les contenus précédents et ajouter l'image générée
                qrCodeContainer.innerHTML = '';
                qrCodeContainer.appendChild(qrCodeImage);
            }
        });
    };

    // Déclencher la génération du QR code une fois que l'image du ticket est chargée
    ticketImage.onload = function() {
        var qrCodeSize = Math.min(ticketImage.clientWidth, ticketImage.clientHeight) * 0.35;
        generateQRCode(qrCodeSize);
    };

    // Si l'image du ticket est déjà chargée (en cache), déclencher manuellement l'event onload
    if (ticketImage.complete) {
        ticketImage.onload();
    } else {
        // Définir la source de l'image ici si nécessaire
        // ticketImage.src = 'chemin/vers/l-image-du-ticket.png';
    }
}
  

// Modifiez la fonction saveTicket pour enregistrer au format PDF
function saveTicket() {
    html2canvas(document.querySelector(".ticket-image-container")).then(canvas => {
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        
        var urlParams = new URLSearchParams(window.location.search);
        var ticketId = urlParams.get("id");
        var firstName = urlParams.get("firstName");
        
        pdf.save(ticketId + "-" + firstName + ".pdf");
    });
}
 function shareTicket() {
    saveTicket();
     html2canvas(document.querySelector(".ticket-image-container")).then(canvas => {
        var urlParams = new URLSearchParams(window.location.search);
        var phoneNumber = urlParams.get("phoneNumber");
        var shareLink = "https://wa.me/" + phoneNumber + "?text=ci%20joint%20votre%20pass";
        window.open(shareLink);
      }); }

 function goToHomePage() {
      window.location.href = "page_formulaire.html";
    }
    function showHistorique() {
        // ... (rest of the code)
        const db = getFirestore();
        const tableBody = document.querySelector("tbody");
    
        // Effacer les données existantes dans le tableau
        tableBody.innerHTML = '';
    
        // Reference to the collection in Firestore
        const ticketsRef = collection(db, 'tickets');
        const queryOrderedTickets = query(ticketsRef, orderBy("ticketId"));
        // Retrieve the ticket data from Firestore
        getDocs(queryOrderedTickets)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const ticket = doc.data(); // Obtenir les données du document
                    console.log(ticket); 
                    // Update the HTML table with the ticket data
                    const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${ticket.ticketId}</td>
                    <td>${ticket.firstName}</td>
                    <td>${ticket.phoneNumber}</td>
                    <td>${ticket.gender}</td>
                    <td><button onclick="redirectToTicket('${ticket.ticketId}', '${ticket.firstName}', '${ticket.phoneNumber}', '${ticket.gender}')">Ticket</button></td>
                `;
                tableBody.appendChild(row);
            });
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
            });
    }
    function redirectToTicket(ticketId, firstName, phoneNumber, gender) {
        const params = new URLSearchParams({ id: ticketId, firstName: firstName, phoneNumber: phoneNumber, gender: gender });
        window.location.href = `page_tickets.html?${params.toString()}`;
    }
    
      if (window.location.pathname.endsWith('page_historique.html')) {
        document.addEventListener('DOMContentLoaded', () => {  
            // Appeler la fonction pour afficher l'historique quand la page est chargée.
            showHistorique();
          });
    }
      function exportToCSV() {
        // Logique pour exporter l'historique en CSV
        // ...
      }
  
      function exportToPDF() {
        // Logique pour exporter l'historique en PDF
        // ...
      }
  
      function goToHomerPage() {
        window.location.href = "index.html";
      }

// Exposer les fonctions pour qu'elles soient accessibles dans le HTML
window.generateTicket = generateTicket;
window.showHistory = showHistory;
window.generateQRCode = generateQRCode;
window.saveTicket = saveTicket;
window.goToHomePage = goToHomePage;
window.shareTicket = shareTicket;
window.generateTickets = generateTickets;
window.showHistorique = showHistorique;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.goToHomerPage = goToHomerPage;
window.redirectToTicket = redirectToTicket;
window.setNextTicketId = setNextTicketId;
