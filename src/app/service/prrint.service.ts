import { Injectable } from "@angular/core";
declare var jsPDF: any;
import * as $ from "jquery";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class PrrintService {
  printMapObjet = {
    titre: "",
    description: "",
  };
  logo: string;
  constructor() {}

  createPDFObject(
    imgData,
    type,
    format,
    compress,
    WGS84,
    getmetricscal: any,
    titre,
    description
  ) {
    try {
      var lMargin = 15;
      var rMargin = 15;
      var pdfInMM = 550;
      var d = new Date();
      var month = d.getMonth() + 1;
      var dd = d.getDate();
      var doc = new jsPDF("p", "pt", "a4", false);
      doc.setFontSize(15);
      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 595.28, 841.89, "F");
      if (titre != "") {
        doc.text(35, 170, "Titre de la carte : " + titre + "");
      } else {
        doc.text(
          35,
          170,
          "Carte du GéoPortail - GeOsm - " + environment.nom.toUpperCase()
        );
      }
      doc.setFontSize(25);
      doc.setTextColor(28, 172, 119);
      // doc.text(110, 50,"GeoCameroun");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      // doc.text(110, 65,"Infrastrucutre de données spatiales");
      doc.setFontSize(14);
      doc.text(
        465,
        55,
        "" + d.getDate() + "/" + month + "/" + d.getFullYear() + ""
      );
      doc.addImage(imgData["png1"], 20, 20, 100, 40);
      doc.addImage(
        imgData["png0"],
        format,
        20,
        200,
        550,
        350,
        undefined,
        compress
      );
      doc.rect(20, 120, 550, 500, "D");
      doc.setFontSize(10);
      doc.text(400, 570, "Centroïde de la carrte en WGS84");
      doc.text(400, 585, "Longitude : " + WGS84[0].toFixed(4));
      doc.text(400, 600, "Laltitude : " + WGS84[1].toFixed(4));
      doc.text(60, 570, "Échelle :1/" + getmetricscal.toFixed(4));
      doc.rect(20, 650, 550, 100, "D");
      doc.setFontSize(9);
      if (description != "") {
        var lines = doc.splitTextToSize(
          "" + description + "",
          pdfInMM - lMargin - rMargin
        );
        doc.text(29, 670, lines);
      }

      doc.text(
        25,
        800,
        "Copyright © " + d.getFullYear() + ", " + environment.url_frontend
      );
      doc.save(
        "carte_GC_" +
          d.getDate() +
          "_" +
          d.getMonth() +
          "_" +
          d.getFullYear() +
          "_.pdf"
      );
      titre = "";
      description = "";
      /* printMapObjet = {
        'titre': '',
        'description': '',
      }*/
      $("#loading_print").hide();
    } catch (e) {
      $("#loading_print").hide();
      alert("Un problème est survenu lors de la création de votre carte");
      //  $('.search').hide();
      //  $("#Err").html("une erreur est survenue lors de l'impression");
      //   document.getElementById("DivMsgErr").style.top = "0px";
    }
  }
}
