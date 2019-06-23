import { Pipe, PipeTransform } from '@angular/core';

import { Donnes } from './donne';
@Pipe({
    name: 'donneFilter',
    pure: false
})


export class donneFilterPipe implements PipeTransform {
    // transform(value: string): string {
	// 	return 'bookfilter : '+ value
    // }
    
  transform(items: Donnes[], filter: Donnes): Donnes[] {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be kept, false will be filtered out
    return items.filter((item: Donnes) => this.applyFilter(item, filter));
  }
  
  /**
   * Perform the filtering.
   * 
   * @param {Book} book The book to compare to the filter.
   * @param {Book} filter The filter to apply.
   * @return {boolean} True if book satisfies filters, false if not.
   */
  applyFilter(book: Donnes, filter: Donnes): boolean {
    for (let field in filter) {
      if (filter[field]) { 
        if (typeof filter[field] === 'string') { 
          if (book[field].toLowerCase().indexOf(filter[field].toLowerCase()) === -1) {
            return false;
          }
        } else if (typeof filter[field] === 'number') {
          if (book[field] !== filter[field]) {
            return false;
          }
        }
      }
    }
    return true;
  }
}