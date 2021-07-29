import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import * as moment from 'moment';

export class CHATS {
  $key: string;
  name: string;
  uid: string;
  message: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit  {
  email: string;
  uid: string;
  name: string;

  Chats: CHATS[];
  todoForm: FormGroup;
  FormToSend: FormGroup;

  constructor(
    private crudService: CrudService,
    private navCtrl: NavController,
    private authService: AuthenticationService,
    public formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.authService.userDetails().subscribe(user => {
      console.log('res',user)
      if(user !== null){
        this.email = user.email;
        this.uid = user.uid;
        this.crudService.getUser(this.uid).subscribe((res)=>{
            this.name = res['name'];
        });
      }else {
        this.navCtrl.navigateBack('');
      }
      
    }, err => {
      console.log('err', err);
    });

    this.crudService.getChats().subscribe((res) => {
      this.Chats = res.map((t) => {
        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as CHATS
        };
      })
    });

    this.todoForm = this.formBuilder.group({
      message: [''],
    });
  }

  logout() {
    this.authService.logoutUser()
      .then(res => {
        console.log(res);
        this.navCtrl.navigateBack('');
      })
      .catch(error => {
        console.log(error);
      })
  }

  todoList() {
    this.crudService.getChats()
    .subscribe((data) => {
      console.log(data)
    })
  }


  onSubmit() {
    
    if (!this.todoForm.valid) {
      return false;
    } else {
      this.FormToSend = this.formBuilder.group({
        message : this.todoForm.value.message,
        name: this.name,
        email: this.email,
        uid: this.uid,
        create: moment().unix()
      })
      this.crudService
        .create(this.FormToSend.value)
        .then(() => {
          this.todoForm.reset();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

}
