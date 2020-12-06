import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDm45btZCXxJiV0KKER1HZ-fuStkNVEGUI",
    authDomain: "bookwilly-5bf39.firebaseapp.com",
    databaseURL: "https://bookwilly-5bf39.firebaseio.com",
    projectId: "bookwilly-5bf39",
    storageBucket: "bookwilly-5bf39.appspot.com",
    messagingSenderId: "166054677438",
    appId: "1:166054677438:web:bea658c673a151b2d747ef"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()