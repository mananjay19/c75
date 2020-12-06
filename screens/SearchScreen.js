import React from 'react';
import { Text, View, FlatList } from 'react-native';
import db from '../config.js'

export default class Searchscreen extends React.Component {
  constructor(props){
    super(props)
    this.state={
      allTransactions:[]
    }
  }
  componentDidMount = async()=>{
    const query= await db.collection("transactions").get()
    query.docs.map((doc)=>{
      console.log(doc.data())
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()]
      })
    })
  }
    render() {
      return (
       
        <FlatList
        data={this.state.allTransactions}
        renderItem={({item})=>(
          <View>

            <Text>{"book Id: "+item.bookId}</Text>
            <Text>{"student Id: "+item.studentId}</Text>
            <Text>{"trancaction type : "+item.transactionType}</Text>
            <Text>{"date: "+item.date}</Text>
          </View>         
        )}
        keyExtractor={(item,index)=> index.toString()}
        
        />

        
      );
    }
  }