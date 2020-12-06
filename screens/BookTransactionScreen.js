import React from 'react';
import { Text, View, Image, KeyboardAvoidingView, Alert } from 'react-native';
import { TouchableOpacity, TextInput } from 'react-native-gesture-handler';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../config.js'
import firebase from 'firebase'
//import console = require('console');
export default class TransactionScreen extends React.Component {
  constructor(){
    super()
     this.state={
       hasCameraPermission: null,
       scaned:false,
       scanedBookId:'',
       scanedStudentId:'',
       buttonState:'normal',
       TransactionMessage:''
     }
    
  }
  getCameraPermission=async(Id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission:status==='granted',
      buttonState:'clicked',
      scaned:false,
buttonState:Id
    })
  }
  handleTransaction=async()=>{
     var transactionType=await this.checkBookEligibility()
     if (!transactionType){
       alert("The book does not exsist in the database")
       this.setState({
         scanedStudentId:'',
         scaneedBookId:''
       })
     }
     else if (transactionType==="issue"){
       var isStudentEligible=await this.checkStudentEligibilityIssue()
       if (isStudentEligible){
         this.initiatebookIssue()
         alert("Book issued to the student")
       }
     }
     else {
      var isStudentEligible=await this.checkStudentEligibilityReturn()
      if (isStudentEligible){
        this.initiatebookReturn()
        alert("Book returned to the library")
      }
     }
  }

  checkStudentEligibilityIssue=async()=>{
    const studentRef=await db.collection("students").where ("studentId","==",this.state.scanedStudentId).get()
    if (studentRef.docs.length===0){
      alert("The student Id does not exsit in the database")
      isStudentEligible=false
      this.setState({
        scanedStudentId:'',
        scaneedBookId:''
      })
    }
    else{
      studentRef.docs.map((doc)=>{
        var student=doc.data()
        if(student.numberOfBookIssued <2){
          isStudentEligible=true
        }else{
          isStudentEligible=false
          alert("This student has already two books issued")
          this.setState({
            scanedStudentId:'',
            scaneedBookId:''
          })
        }
      })
    }
    return isStudentEligible
  }
  checkStudentEligibilityReturn = async()=>{
    const TransactionRef=await db.collection("transactions").where("bookId","==",this.state.scanedBookId).limit(1).get()
    var isStudentEligible=""
    TransactionRef.docs.map((doc)=>{
      var lastBookTransaction=doc.data()
      if (lastBookTransaction.studentId===this.state.scanedStudentId){
        isStudentEligible=true
      }else{
        isStudentEligible=false
        alert("The book was not issued to this student")
        this.setState({
          scanedStudentId:'',
          scaneedBookId:''
        }) 
      }
    })
    return isStudentEligible
  }
  checkBookEligibility=async()=>{
    const bookRef=await db.collection("books").where("bookId","==",this.state.scanedBookId).get()
    var transactionType=""
    if (bookRef.docs.length===0){
      transactionType=false
    }else{
      bookRef.docs.map((doc)=>{
        var book=doc.data()
        if(book.bookAvailibility){
          transactionType="issue"
        }else{
          transactionType="return"
        }
      })
    }
    return transactionType
  }
initiatebookIssue=async()=>{
  db.collection('transactions').add({
    'studentId':this.state.scanedStudentId,
    'bookId': this.state.scanedBookId,
    'date': firebase.firestore.Timestamp.now().toDate(),
    'transactionType': 'issue'
  })
  db.collection('books').doc(this.state.scanedBookId).update({
    'bookAvailibility':false
  })
  db.collection('students').doc(this.state.scanedStudentId).update({
    'numberOfBookIssued':firebase.firestore.FieldValue.increment(1)
  })
  alert("book issued")
  this.setState({
    scanedStudentId:'',
    scaneedBookId:''
  })
}
initiatebookReturn =async()=>{
  db.collection('transactions').add({
    'studentId':this.state.scanedStudentId,
    'bookId': this.state.scanedBookId,
    'date': firebase.firestore.Timestamp.now().toDate(),
    'transactionType': 'return'
  })
  db.collection('books').doc(this.state.scanedBookId).update({
    'bookAvailibility':true
  })
  db.collection('students').doc(this.state.scanedStudentId).update({
    'numberOfBookIssued':firebase.firestore.FieldValue.increment(-1)
  })
  alert("book returned")
  this.setState({
    scanedStudentId:'',
    scaneedBookId:''
  })
}
  hasBarScan=async({type,data})=>{
    const {buttonState}=this.state
    if(buttonState==='BookId'){
    this.setState({
      scaned:true,
      scanedBookId:data,
      buttonState:'normal'
    })
  }
  else if(buttonState==='StudentId'){
    this.setState({
      scaned:true,
      scanedStudentId:data,
      buttonState:'normal'
    })
  }
}
    render() {
      const hasCameraPermission=this.state.hasCameraPermission;
      const scaned=this.state.scaned;
      const buttonState=this.state.buttonState;
      if (buttonState!=='normal' && hasCameraPermission){
        return(
          <BarCodeScanner
          onBarCodeScanned={scaned?undefined:this.hasBarScan}
          ></BarCodeScanner>
        )
      }
      else if(buttonState==='normal') {
      return (
        <KeyboardAvoidingView behavior = 'padding' enabled>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image
          source={require('../assets/booklogo.jpg')}
          style={{width:200, height:200}}
          />
          <Text>{
            hasCameraPermission===true ? this.state.scanedData:'Request camera Permission'}
          </Text>
          <TextInput
          placeholder='book Id'
          onChangeText={text => this.setState({scanedBookId:text})}
          value={this.state.scanedBookId}
          />
          <TouchableOpacity
onPress={()=>{this.getCameraPermission('BookId')}}
          >
            <Text>Scan book Id</Text>
          </TouchableOpacity>
          <TextInput
          placeholder='Student Id'
          onChangeText={text => this.setState({scanedStudentId:text})}
          value={this.state.scanedStudentId}
          />
          <TouchableOpacity
onPress={()=>{this.getCameraPermission('StudentId')}}
          >
            <Text>Scan Student Id</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={()=>{this.handleTransaction();
            this.setState({
              scanedBookId:'',
              scanedStudentId:''
            })
          }}
          >
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      );
    }
  }
}