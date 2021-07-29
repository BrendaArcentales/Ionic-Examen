import { Component, OnInit } from '@angular/core';
import { CrudService } from './../services/crud.service';

export class TODO {
  $key: string;
  name: string;
  category: string;
  title: string;
}

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.page.html',
  styleUrls: ['./todo-list.page.scss'],
})

export class TodoListPage implements OnInit {

  Tasks: TODO[];

  constructor(private crudService: CrudService) { }

  ngOnInit() {
    this.crudService.getTasks().subscribe((res) => {
      this.Tasks = res.map((t) => {
        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as TODO
        };
      })
    });
  }

  todoList() {
    this.crudService.getTasks()
    .subscribe((data) => {
      console.log(data)
    })
  }

  remove(id) {
    console.log(id)
    if (window.confirm('¿Seguro que desea eliminar la tarjeta?')) {
      this.crudService.delete(id)
    }
  }  

}