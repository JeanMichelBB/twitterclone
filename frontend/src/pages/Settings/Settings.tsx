// src/pages/Settings/Settings.tsx
import './Settings.css';
import TwoColumnLayout from '../../TwoColumnLayout';

const Settings = () => {
    return (
        <TwoColumnLayout
          leftContent={
            <>
          <h1>Settings</h1>
          </>
        }
          rightContent={
            <>
            <h1>Settings</h1>
            </>
          }
        />
      );
    };

export default Settings;