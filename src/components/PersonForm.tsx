import { useImmer } from 'use-immer';

export default function PersonForm() {
  const [person, setPerson] = useImmer({
    name: 'Niki de Saint Phalle',
    artwork: {
      title: 'Blue Nana',
      city: 'Hamburg',
    },
  });

  // input change handler for title
  function handleInputTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // update the property of the person object based on the input's name attribute
    setPerson({
      ...person, // spread the existing properties of the person object to preserve them
      artwork: {
        ...person.artwork, // spread the existing properties of the artwork object to preserve them
        [e.target.name]: e.target.value, // dynamically update the property based on the input's name attribute
      },
    });
  }

  function handleInputNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    // update the name property of the person object based on the input's value using Immer's draft mechanism
    setPerson((draft) => {
      // draft is a proxy of the current person state and can be mutated directly without spreading the existing state

      draft.name = e.target.value; // update the name property of the person object based on the input's value
    });
  }

  function handleInputCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    // update the name property of the person object based on the input's value using Immer's draft mechanism
    setPerson((draft) => {
      // draft is a proxy of the current person state and can be mutated directly without spreading the existing state

      draft.artwork.city = e.target.value; // update the name property of the person object based on the input's value
    });
  }

  return (
    <>
      <label>
        Name:
        <input
          name="name"
          value={person.name}
          onChange={handleInputNameChange}
        />
      </label>
      <label>
        Title:
        <input
          name="title"
          value={person.artwork.title}
          onChange={handleInputTitleChange}
        />
      </label>
      <label>
        City:
        <input
          name="city"
          value={person.artwork.city}
          onChange={handleInputCityChange}
        />
      </label>
      <p>
        <i>{person.artwork.title}</i>
        {' by '}
        {person.name}
        <br />
        (located in {person.artwork.city})
      </p>
    </>
  );
}

// never mutate state obkect directly, always use setState or Immer's draft mechanism to update it.
// Helps in detecting changes, triggering re-renders correctly, and maintaining immutability of the state, debugging easier.
// Object.is() is used to compare the previous and next state to determine if a re-render is necessary. It mainly checks for reference equality to detect changes. Deep comparison is not performed, or else it will be expensive and impact performance.
