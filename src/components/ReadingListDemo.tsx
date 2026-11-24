import {
  useReadingListActions,
  useReadingListState,
} from '@contexts/readingList/selectors';
import { Button } from '@components/TailwindProject/Button';
import type { ReadingListItem } from '@contexts/readingList/types';
import { useTranslation } from 'react-i18next';

export const ReadingListDemo = () => {
  'use memo';
  // Access the reading list items from the context
  //   const {items} = useContext(ReadingListContext);
  const { items } = useReadingListState();
  const { addItem } = useReadingListActions();
  // Initialize the translation function for the "readingList" namespace
  const { t, i18n } = useTranslation('readingList');
  // Initialize the translation function for the "common" namespace
  const { t: tCommon } = useTranslation('common');

  const handleAddItem = () => {
    addItem({ id: crypto.randomUUID(), title: 'New Item' });
  };

  // Handle language change dynamically via the select dropdown
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <section className="p-4 bg-dashboard-background text-left font-dashboard">
      <h2 className="font-semibold mb-4 text-dashboard-text">{t('title')}</h2>
      {/* Display the label for the language selector using the "common" namespace. why ? 
            Because the label "Language" is not specific to the reading list, it belongs to the common terms used across the app. */}
      <p>{`Current ${tCommon('language')}: ${i18n.resolvedLanguage ?? i18n.language}`}</p>
      <div className="mb-2 flex flex-row items-start gap-2">
        <Button onClick={handleAddItem}>{t('addItem')}</Button>
        {/* Language selector - change the language of the app dynamically */}
        <select
          value={i18n.resolvedLanguage ?? i18n.language}
          className="border border-gray-800 rounded p-1 self-center text-dashboard-text"
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>
      <br />
      <ul className=" pl-2">
        {items.map((item) => (
          <ReadingItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
};

export const ReadingItem = ({ item }: { item: ReadingListItem }) => {
  'use memo';
  const { removeItem, toggleItemCompletion } = useReadingListActions();
  // Initialize the translation function for the "readingList" namespace
  const { t } = useTranslation('readingList');
  return (
    <li key={item.id} className="mb-2 p-2">
      <span
        className={`mr-2 text-dashboard-text ${item.completed ? 'line-through' : ''}`}
      >
        {item.title}
      </span>
      <Button onClick={() => removeItem(item.id)}>{t('remove')}</Button>
      <Button onClick={() => toggleItemCompletion(item.id)}>
        {t('toggleCompletion')}
      </Button>
    </li>
  );
};
