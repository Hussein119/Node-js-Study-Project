/* eslint-disable no-undef */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NWCuhKQsLXScu3AfoMx4ll5EJc4kb67KqbST3EnsotSMQeKb93YUZAuyYyqkKUBqUJNxSK7lsp2zD93LX90eCxA00l0qcgZpv'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:7000/api/v1/bookings/checkout-session/${tourId}`
    );
    //console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
