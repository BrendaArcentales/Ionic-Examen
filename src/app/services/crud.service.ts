import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';


export class TODO {
  $key: string;
  name: string;
  latitud: string;
  longitud: string;
}
export class CHATS {
  $key: string;
  name: string;
  uid: string;
  message: string;
}

export class USER{
  $key: string;
  email: string;
  uid: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})


export class CrudService {
  constructor(private ngFirestore: AngularFirestore, private router: Router) {}

  create(chat: CHATS) {
    return this.ngFirestore.collection('chats').add(chat);
  }
  createLocation(todo:TODO){
    return this.ngFirestore.collection('location').add(todo);
  }
  createUser(values, id) {
    return this.ngFirestore.collection('usuarios').doc(id).set(values);
  }
  getUser(id) {
    return this.ngFirestore.collection('usuarios').doc(id).valueChanges();
  }
  getChats() {
    return this.ngFirestore.collection('chats', ref=> ref.orderBy("create", "asc")).snapshotChanges();
  }
  getTasks() {
    return this.ngFirestore.collection('location').snapshotChanges();
  }

  getTask(id) {
    return this.ngFirestore.collection('positions').doc(id).valueChanges();
  }

  update(id, todo: TODO) {
    this.ngFirestore
      .collection('positions')
      .doc(id)
      .update(todo)
      .then(() => {
        this.router.navigate(['/todo-list']);
      })
      .catch((error) => console.log(error));
  }

  delete(id: string) {
    this.ngFirestore.doc('positions/' + id).delete();
  }
}
