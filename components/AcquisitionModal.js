import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from '../styles/AcquisitionModal.module.css';
import axios from 'axios';

const AcquisitionModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  // Validation schemas for each step with consent checkbox
  const validationSchemas = [
    // Step 1: Collection experience
    Yup.object({
      collectionExperience: Yup.string().required('Please select an option'),
    }),
    // Step 2: Inquiry type
    Yup.object({
      inquiryType: Yup.string().required('Please select an option'),
    }),
    // Step 3: Acquisition goals
    Yup.object({
      acquisitionGoal: Yup.string().required('Please select an option'),
    }),
    // Step 4: Collection tier
    Yup.object({
      collectionTier: Yup.string().required('Please select an option'),
    }),
    // Step 5: Inquiry role
    Yup.object({
      inquiryRole: Yup.string().required('Please select an option'),
    }),
    // Step 6: Contact information with consent checkbox
    Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string(),
      consent: Yup.boolean().oneOf([true], 'You must consent to the privacy policy')
    }),
  ];
  
  // Questions for each step
  const steps = [
    {
      title: '1. HAVE YOU COLLECTED ORIGINAL ART BEFORE?',
      fieldName: 'collectionExperience',
      options: [
        { value: 'experienced', label: 'YES — I\'VE COLLECTED WORKS FROM NOTABLE ARTISTS.' },
        { value: 'beginner', label: 'YES — I\'M EARLY IN MY JOURNEY, BUT I KNOW WHAT I LIKE.' },
        { value: 'new', label: 'NO — BUT I\'M READY TO BEGIN.' },
      ]
    },
    {
      title: '2. ARE YOU INQUIRING ABOUT A SPECIFIC WORK OR OPEN TO OTHERS?',
      fieldName: 'inquiryType',
      options: [
        { value: 'specific', label: 'I HAVE A SPECIFIC PIECE IN MIND' },
        { value: 'open', label: 'OPEN TO AVAILABLE AND UPCOMING' },
        { value: 'both', label: 'BOTH' },
      ]
    },
    {
      title: '3. WHAT DESCRIBES YOUR ACQUISITION GOALS BEST?',
      fieldName: 'acquisitionGoal',
      options: [
        { value: 'investment', label: 'RARE AND INVESTMENT-GRADE' },
        { value: 'curated', label: 'PERSONALLY CURATED' },
        { value: 'legacy', label: 'LONG-TERM LEGACY' },
        { value: 'emotional', label: 'I COLLECT BASED ON EMOTIONAL CONNECTION' },
      ]
    },
    {
      title: '4. WHICH TIER REFLECTS YOUR CURRENT COLLECTION STRATEGY?',
      fieldName: 'collectionTier',
      options: [
        { value: 'tier1', label: '$250K — $1M+' },
        { value: 'tier2', label: '$50K — $250K' },
        { value: 'tier3', label: '$25K — $50K' },
        { value: 'tier4', label: '$5K — $25K' },
      ]
    },
    {
      title: '5. ARE YOU INQUIRING FOR YOURSELF OR SOMEONE ELSE?',
      fieldName: 'inquiryRole',
      options: [
        { value: 'private', label: 'FOR MY PRIVATE COLLECTION' },
        { value: 'behalf', label: 'ON BEHALF OF A COLLECTOR' },
        { value: 'advisor', label: 'ADVISOR / CONSULTANT' },
        { value: 'other', label: 'OTHER' },
      ]
    },
    {
      title: '6. CONTACT INFORMATION',
      fieldName: 'contactInfo',
      isContactForm: true
    }
  ];

  // Handle moving to the next step
  const handleNextStep = (values) => {
    setCurrentStep(currentStep + 1);
    console.log(`Moving to step ${currentStep + 1}`, values);
  };

  // Handle form submission (last step)
  const handleFinalSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('Submitting form data:', values);
      const response = await axios.post('/api/submitInquiry', values);
      console.log('Form submitted successfully:', response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was a problem submitting your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Combined handler that either moves to next step or submits form
  const handleSubmit = (values, { setSubmitting }) => {
    if (currentStep < steps.length - 1) {
      handleNextStep(values);
      setSubmitting(false);
    } else {
      handleFinalSubmit(values, { setSubmitting });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  // Close the modal and reset state
  const closeModal = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className={styles.thankYou}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <h2 className={styles.modalHeading}>THANK YOU FOR YOUR INTEREST</h2>
            <p>YOUR INQUIRY HAS BEEN SUBMITTED. WE'LL BE IN TOUCH SOON.</p>
          </div>
        ) : (
          <Formik
            initialValues={{
              collectionExperience: '',
              inquiryType: '',
              acquisitionGoal: '',
              collectionTier: '',
              inquiryRole: '',
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              consent: false,
            }}
            enableReinitialize={false}
            validateOnChange={false}
            validateOnBlur={true}
            validationSchema={validationSchemas[currentStep]}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <button className={styles.closeButton} onClick={closeModal}>×</button>
                <h2 className={styles.modalHeading}>ACQUISITION INQUIRY</h2>
                <div className={styles.step}>
                  <h3 className={styles.stepHeading}>{steps[currentStep].title}</h3>
                  
                  {!steps[currentStep].isContactForm ? (
                    <div className={styles.options}>
                      {steps[currentStep].options.map((option, index) => (
                        <div key={index} className={styles.optionContainer}>
                          <Field 
                            type="radio" 
                            name={steps[currentStep].fieldName} 
                            value={option.value} 
                            id={`${steps[currentStep].fieldName}-${option.value}`}
                            className={styles.radioInput}
                          />
                          <label 
                            htmlFor={`${steps[currentStep].fieldName}-${option.value}`}
                            className={styles.radioLabel}
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.contactForm}>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="firstName">FIRST NAME</label>
                          <Field 
                            type="text" 
                            name="firstName" 
                            id="firstName" 
                            className={styles.textInput}
                          />
                          <ErrorMessage name="firstName" component="div" className={styles.errorMessage} />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="lastName">LAST NAME</label>
                          <Field 
                            type="text" 
                            name="lastName" 
                            id="lastName" 
                            className={styles.textInput}
                          />
                          <ErrorMessage name="lastName" component="div" className={styles.errorMessage} />
                        </div>
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone">PHONE</label>
                          <Field 
                            type="tel" 
                            name="phone" 
                            id="phone" 
                            className={styles.textInput}
                          />
                          <ErrorMessage name="phone" component="div" className={styles.errorMessage} />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="email">EMAIL</label>
                          <Field 
                            type="email" 
                            name="email" 
                            id="email" 
                            className={styles.textInput}
                          />
                          <ErrorMessage name="email" component="div" className={styles.errorMessage} />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <div className={styles.consentContainer}>
                          <Field
                            type="checkbox"
                            name="consent"
                            id="consent"
                            className={styles.checkboxInput}
                          />
                          <label htmlFor="consent" className={styles.checkboxLabel}>
                            I CONSENT TO MY PERSONAL DATA BEING PROCESSED FOR THE PURPOSE OF RECEIVING ARTWORK INFORMATION AND COMMUNICATIONS FROM JACK CARDEN'S STUDIO.
                          </label>
                        </div>
                        <ErrorMessage name="consent" component="div" className={styles.errorMessage} />
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.buttons}>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className={styles.button}
                    >
                      PREVIOUS
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.button}
                  >
                    {currentStep === steps.length - 1 ? 'APPLY FOR WAITLIST' : 'NEXT'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default AcquisitionModal;
