import { GithubUser } from './githubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    this.tbody = this.root.querySelector('table tbody')

    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(
        entry => entry.login.toUpperCase() === username.toUpperCase()
      )

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.removeBackground()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search-area button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search-area input')

      this.add(value)
      this.root.querySelector('.search-area input').value = ''
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.delete').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)

      this.removeBackground()
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
        <td class="user">
          <img
            src="https://github.com/maykbrito.png"
            alt="Imagem de maykbrito"
          />
          <a href="https://github.com/maykbrito" target="_blank">
            <p>Mayk Brito</p>
            <span>maykbrito</span>
          </a>
        </td>
        <td class="repositories">76</td>
        <td class="followers">9589</td>
        <td>
          <button class="delete">Remover</button>
        </td>
      `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }

  removeBackground() {
    const nonFav = this.root.querySelector('.non-fav')
    const user = this.root.querySelector('.user')
    const exists = this.root.contains(user)

    if (exists == true) {
      nonFav.classList.add('remove')
    } else {
      nonFav.classList.remove('remove')
    }
  }
}
