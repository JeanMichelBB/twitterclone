// src/pages/NotFound/NotFound.tsx
import './NotFound.css';
import TwoColumnLayout from '../../TwoColumnLayout';
import Footer from '../../components/Footer/Footer';


const NotFound = () => {
    return (
        <TwoColumnLayout
          leftContent={
            <>
          <h1>Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
          </>
        }
          rightContent={
            <>
              <Footer />
            </>
          }
        />
      );
    };

export default NotFound;