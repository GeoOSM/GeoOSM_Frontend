import { Component, OnInit,NgZone } from '@angular/core';
import { NgwWowService } from 'ngx-wow';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import {Router} from "@angular/router";

const position = []

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})



export class HomeComponent implements OnInit {
  
  header = 1
  menu = 1
  before
  private wowSubscription: Subscription;


  constructor(
  	private zone: NgZone,
  	private router: Router,
    private wowService: NgwWowService
  ) { 
  }

  ngOnInit() {

	  	this.wowService.init();
	    
	    this.wowSubscription = this.wowService.itemRevealed$.subscribe(
	      (item: HTMLElement) => {
	        console.log(item)
	        // do whatever you want with revealed element
	    })


	     var nombre_sections = 7
	    var section_en_cours = 1

	    for (var i = 1; i <= nombre_sections; i++) {
	      if (i != 1) {
	        $('.title_' + i).hide()
	      }
	    }




	    setTimeout(function () {
	      window.scrollTo(0, 0);

	    }, 500)
	    var easeInOutQuad = function (t, b, c, d) {
	      t /= d / 2;
	      if (t < 1) return c / 2 * t * t + b;
	      t--;
	      return -c / 2 * (t * (t - 2) - 1) + b;
	    }
	    function scrollTo(element, to, duration, start) {

	      var change = to - start,
	        currentTime = 0,
	        increment = 20;

	      var animateScroll = function () {
	        currentTime += increment;
	        var val = easeInOutQuad(currentTime, start, change, duration);

	        element.scrollTo(0, val)
	        if (currentTime < duration) {
	          setTimeout(animateScroll, increment);
	        }
	      };
	      animateScroll();
	    }

	    var elem = $('body')[0],
	      info = document.getElementById('info'),
	      marker = true,
	      delta,
	      direction,
	      interval = 50,
	      counter1 = 0,
	      counter2;


	    if (elem.addEventListener) {
	      if ('onwheel' in document) elem.addEventListener('wheel', wheel);
	      else if ('onmousewheel' in document) elem.addEventListener('mousewheel', wheel);
	      else elem.addEventListener('MozMousePixelScroll', wheel);
	    } else elem.attachEvent('onmousewheel', wheel);

	    function wheel(e) {
	      counter1 += 1;
	      e = e || window.event;
	      delta = e.deltaY || e.detail || e.wheelDelta;
	      if (delta > 0) { direction = 'up'; } else { direction = 'down'; }
	      if (marker) wheelStart(e);
	      return false;
	    }
	    function wheelStart(e) {
	      marker = false;

	      wheelAct(e);

	    }
	    function wheelAct(e) {
	      counter2 = counter1;
	      setTimeout(function () {
	        if (counter2 == counter1) {

	          wheelEnd(e);
	        } else {
	          wheelAct(e);

	        }
	      }, interval);
	    }

	    function scrollDown() {
	      scrollTo(window, $(window).height() * section_en_cours, 800, $(window).height() * (section_en_cours - 1))

	      section_en_cours = section_en_cours + 1
	      $('.swiper-pagination-bullet').css('background', $('.title_' + section_en_cours).css('color'))
	      setTimeout(function () {
	        //$('#header').css('border-color', $('.title_' + section_en_cours).css('color'))

	        $('.home_earth ').css('z-index', '-1')
	        $('.bullet_' + section_en_cours).addClass('swiper-pagination-bullet-active')
	        $('.bullet_' + (section_en_cours - 1)).removeClass('swiper-pagination-bullet-active')
	        $('.title_' + (section_en_cours - 1)).hide()
	        $('.title_' + section_en_cours).show()
	      }, 800)
	      //  console.log(1)
	    }

	    function scrollUp() { 
	      section_en_cours = section_en_cours - 1

	      scrollTo(window, $(window).height() * (section_en_cours - 1), 800, $(window).height() * section_en_cours)
	      $('.swiper-pagination-bullet').css('background', $('.title_' + section_en_cours).css('color'))
	      setTimeout(function () {
	        //$('#header').css('border-color', $('.title_' + section_en_cours).css('color'))



	        $('.bullet_' + section_en_cours).addClass('swiper-pagination-bullet-active')
	        $('.bullet_' + (section_en_cours + 1)).removeClass('swiper-pagination-bullet-active')
	        $('.title_' + (section_en_cours + 1)).hide()
	        $('.title_' + section_en_cours).show()
	      }, 800)
	      if (section_en_cours == 1) {
	        $('.home_earth ').css('z-index', '1')
	      }
	      // console.log(2)
	    }

	    function wheelEnd(e) { 
	      setTimeout(function () {
	        marker = true
	      }, 600)

	      counter1 = 0,
	        counter2 = 0;


	      if (e.deltaY > 0 && section_en_cours < nombre_sections && section_en_cours != nombre_sections) { console.log(0)

	      

	          if (position[0]) {
	            scrollDown()
	          }

	       else {
	          scrollDown()
	        }


	      } else if (e.deltaY < 0 && section_en_cours != 1 && section_en_cours <= nombre_sections ) { console.log(1)
	        
	      	
	          if (position[0]) { 
	            scrollUp()
	          }

	       else { 
	          scrollUp()
	        }
	      }

	    }


  }

  goto(){ console.log(78117)
    	this.router.navigate(['map']); 
    }

}
