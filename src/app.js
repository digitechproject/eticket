
// Importer les bibliothèques Firebase Firestore
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

// ...
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

// Function to generate QR code
function generateQRCode() {
    // Validation des données
    var ticketId = document.getElementById("ticketId").value;
    var firstName = document.getElementById("firstName").value;
    var phoneNumber = document.getElementById("phoneNumber").value;
    var gender = document.getElementById("gender").value;

    if (!ticketId || !firstName || !phoneNumber || !gender) {
        alert("Veuillez remplir tous les champs du formulaire.");
        return;
    }

    // Générer le contenu du QR code en utilisant les informations du formulaire
    var qrCodeContent = ticketId + "-" + firstName + "-" + phoneNumber + "-" + gender;

    // Utiliser la bibliothèque qrcode.js pour générer le QR code
    var qrCode = new QRCode(document.getElementById("qrCode"), {
        text: qrCodeContent,
        width: 128,
        height: 128
    });

    // Enregistrer les informations du ticket dans Firebase Firestore
    const db = getFirestore(app);
    addDoc(collection(db, "tickets"), {
        ticketId: ticketId,
        firstName: firstName,
        phoneNumber: phoneNumber,
        gender: gender
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        // Rediriger vers la page "tickets générés" avec les informations nécessaires
        window.location.href = "page_tickets.html?id=" + ticketId + "&firstName=" + firstName + "&phoneNumber=" + phoneNumber + "&gender=" + gender;
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        alert("Une erreur s'est produite lors de l'enregistrement du ticket. Veuillez réessayer plus tard.");
    });
}