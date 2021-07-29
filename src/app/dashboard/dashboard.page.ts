//IMPORTAR LOS MODULOS NECESARIOS PARA LAS FUNCIONES.

import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../services/crud.service';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';

declare var google;

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboar.page.scss'],
})
export class DashboardPage  implements OnInit {
  todoForm: FormGroup;
  completeForm: FormGroup;

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address:string;
  lat: string;
  long: string;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;
  userEmail: string;


  constructor(
    private crudService: CrudService,
    public formBuilder: FormBuilder,
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    public zone: NgZone,
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  //CARGAMOS EL MAPA EN ONINIT
  ngOnInit() {
    this.loadMap();
    this.todoForm = this.formBuilder.group({
      name: [''],
    });
    this.authService.userDetails().subscribe(res => {
      console.log('res', res);
      if (res !== null) {
        this.userEmail = res.email;
      } else {
        this.navCtrl.navigateBack('');
      }
    }, err => {
      console.log('err', err);
    })
  }

  //CARGAR EL MAPA TIENE DOS PARTES
  loadMap() {

    //OBTENEMOS LAS COORDENADAS DESDE EL TELEFONO.
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map, this.map.center.lat());
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
        this.lat = this.map.center.lat()
        this.long = this.map.center.lng()
      });
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }


  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords "+lattitude+" "+longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };
    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if(value.length>0)
          responseAddress.push(value);
        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value+", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) =>{
        this.address = "Address Not Available!";
      });
  }

  //FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
  ShowCords(){
    alert('lat' +this.lat+', long'+this.long )
  }

  //AUTOCOMPLETE, SIMPLEMENTE ACTUALIZAMOS LA LISTA CON CADA EVENTO DE ION CHANGE EN LA VISTA.
  UpdateSearchResults(){
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
    (predictions, status) => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          this.autocompleteItems.push(prediction);
        });
      });
    });
  }

  //FUNCION QUE LLAMAMOS DESDE EL ITEM DE LA LISTA.
  SelectSearchResult(item) {
    //AQUI PONDREMOS LO QUE QUERAMOS QUE PASE CON EL PLACE ESCOGIDO, GUARDARLO, SUBIRLO A FIRESTORE.
    //HE AÑADIDO UN ALERT PARA VER EL CONTENIDO QUE NOS OFRECE GOOGLE Y GUARDAMOS EL PLACEID PARA UTILIZARLO POSTERIORMENTE SI QUEREMOS.
    alert(JSON.stringify(item))
    this.placeid = item.place_id
  }


  //LLAMAMOS A ESTA FUNCION PARA LIMPIAR LA LISTA CUANDO PULSAMOS IONCLEAR.
  ClearAutocomplete(){
    this.autocompleteItems = []
    this.autocomplete.input = ''
  }

  //EJEMPLO PARA IR A UN LUGAR DESDE UN LINK EXTERNO, ABRIR GOOGLE MAPS PARA DIRECCIONES.
  GoTo(){
    return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+this.placeid;
  }


  onSubmit() {
    if (!this.todoForm.valid) {
      return false;
    } else {
      this.completeForm = this.formBuilder.group({
        name: this.todoForm.value.name,
        latitud: this.lat,
        longitud: this.long,
      });
      this.crudService
        .create(this.completeForm.value)
        .then(() => {
          this.todoForm.reset();
          this.router.navigate(['/todo-list']);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  logout() {
    this.authService.logoutUser()
      .then(res => {
        console.log(res);
        this.navCtrl.navigateBack('/login');
      })
      .catch(error => {
        console.log("esto es un error",error);
      })
  }

}