import { useRef, useState } from 'react';

const Profile = () => {
  return (
    <img
      src="https://react.dev/images/docs/scientists/QIrZWGIs.jpg"
      alt="Alan L. Hart"
    />
  );
};

const Gallery = () => {
  const now = new Date();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: 'Saurabh' });
  const countRef = useRef(0);

  const handleIncrement = () => {
    setCount(count + 1);
    countRef.current = count + 1;
    //user.name = "Guddu"; // why I can see the updated name immediately in the UI even without calling setUser? - because React state objects are references, and mutating the object directly affects the UI
    setUser({ ...user }); // this will trigger a re-render and reflect the updated name in the UI. It will update reference to the user object & Object.is() will detect the change because the reference is different now. Triggering a re-render ensures the UI is updated with the new state.

    setTimeout(() => {
      // why it doesn't reflect the updated value immediately ?
      console.log(count); // still shows the old value because state updates are asynchronous
      console.log(countRef.current); // shows the updated value immediately because refs are mutable and not affected by asynchronous state updates
    }, 2000);
  };

  return (
    <section>
      <h1 onClick={handleIncrement}>
        Amazing scientists {count}
        {user.name}
      </h1>
      <Profile />
      <Profile />
      <Profile />
      <br />
      {now.toLocaleTimeString()}
    </section>
  );
};

export default Gallery;
