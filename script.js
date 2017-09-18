class App {

  constructor() {
    this.form = document.querySelector('form');
    this.select = document.querySelector('select');
    this.button = document.querySelector('button[type="button"]');
    this.list = document.querySelector('ul.list-group');
    this.checkboxes = document.querySelectorAll('input[type="checkbox"]');

    this.items = [];
    this.types = [];
    this.sorted = false;

    this.fetchData();
    
    this.form.addEventListener('submit', () => this.addItem(event));
    this.button.addEventListener('click', () => this.toggleExpiry());
  }
  
  async fetchData() {
    try {
      let items = fetch('http://rygorh.dev.monterosa.co.uk/todo/items.php');
      let types = fetch('http://rygorh.dev.monterosa.co.uk/todo/types.php');
      
      items = await items;
      types = await types;
      
      this.items = await items.json();
      this.types = await types.json();

      this.items = this.items
        .map((item, index) => Object.assign(item, { id: index }));
      
      this.printData();
    }
    catch (error) {
      throw new Error(error);
    }
  }
    
  printData() {
    this.printItems();
    this.printTypes();
  }

  printItems(data = this.items) {
    const items = data
      .reduce((items, item, index) => {
        const date = new Date(item.expires_at);
        
        const formatDate = `${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() } ${ date.getMonth() + 1 }/${ date.getDay() + 1 }/${ date.getFullYear() }`;

        let type;

        if (item.type) {
          type = this.types
            .find(type => type.id === item.type);
        }

        return items += `
          <li class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
              <span class="mr-3">
              <input type="checkbox" class= name="${item.task}" value="${item.done}" data-id="${item.id}" ${item.done ? 'checked' : '' }>
              </span>  
              <span class="mr-auto text-left">
                ${item.task}
                ${ item.type ? `<span class="badge badge-light">${type.name}</span>` : '' }
              </span>
              <time class="ml-5 text-muted">${formatDate}</time>
            </div>
          </li>
        `
      }, '');
    
    this.list
      .innerHTML = items;
    
    this.listenCheckboxes();
  }

  listenCheckboxes() {
    this.checkboxes
      .forEach(checkbox => checkbox.removeEventListener('change', null));
    
    this.checkboxes = document.querySelectorAll('input[type="checkbox"]');

    this.checkboxes
      .forEach(checkbox => checkbox.addEventListener('change', () => this.toggleDone(event)));
  }

  printTypes() {
    const types = this.types
      .slice()
      .sort((a, b) => a.id - b.id)
      .reduce((types, type) => types += `<option value="${type.id}">${type.name}</option>`, '<option selected>Type…</option>');
    
    this.select
      .innerHTML = types;
  }

  addItem(event) {
    event.preventDefault();

    const form = new FormData(this.form);

    const task = form.get('task'),
          type = Number(form.get('type'));
    
    let expiry = form.get('expiry');

    expiry = new Date(expiry).getTime();

    const item = {
      id: this.items.length,
      task,
      expires_at: expiry,
      created_at: Date.now(),
      done: false,
      type
    };

    this.items
      .unshift(item);

    if (this.sorted) {
      const items = this.sortExpiry();
      this.printItems(items);
    } else {
      this.printItems();
    }

    this.form.reset();
  }

  toggleExpiry() {
    if (this.sorted) {
      this.printItems();
    } else {
      const items = this.sortExpiry();
      this.printItems(items);
    }
      
    this.sorted = !this.sorted;
  }
    
  sortExpiry() {
    return this.items
      .slice()
      .sort((a, b) => a.expires_at - b.expires_at);
  }

  toggleDone(event) {
    const id = Number(event.target.dataset.id);

    const index = this.items
      .findIndex(element => element.id === id);
    
    this.items[index].done = !this.items[index].done;
  }

}

const app = new App();