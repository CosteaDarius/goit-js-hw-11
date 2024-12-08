import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '47522593-d7c2c1229857c5e8207da38d0';
const BASE_URL = 'https://pixabay.com/api/';

let currentPage = 1;
let currentQuery = '';
const perPage = 40;

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', fetchMoreImages);

async function onSearch(event) {
  event.preventDefault();
  currentQuery = event.target.searchQuery.value.trim();
  currentPage = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('hidden');

  if (!currentQuery) {
    Notiflix.Notify.warning('Please enter a search term!');
    return;
  }

  try {
    const images = await fetchImages();
    displayImages(images);
  } catch (error) {
    Notiflix.Notify.failure('No images found. Please try again.');
  }
}

async function fetchImages() {
  const response = await axios.get(BASE_URL, {
    params: {
      key: API_KEY,
      q: currentQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: currentPage,
      per_page: perPage,
    },
  });

  const { hits, totalHits } = response.data;

  if (currentPage === 1 && totalHits > 0) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (!hits.length) {
    throw new Error('No images found');
  }

  return hits;
}

function displayImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <div class="photo-card">
          <a href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
          <div class="info">
            <p><b>Likes:</b> ${likes}</p>
            <p><b>Views:</b> ${views}</p>
            <p><b>Comments:</b> ${comments}</p>
            <p><b>Downloads:</b> ${downloads}</p>
          </div>
        </div>
      `
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);

  const lightbox = new SimpleLightbox('.gallery a', { captionDelay: 250 });
  lightbox.refresh();

  loadMoreBtn.classList.remove('hidden');
}

async function fetchMoreImages() {
  currentPage += 1;

  try {
    const images = await fetchImages();
    displayImages(images);

    if (images.length < perPage) {
      Notiflix.Notify.info("You've reached the end of the results.");
      loadMoreBtn.classList.add('hidden');
    }
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong. Please try again.');
  }
}
