import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from '../styles/AcquisitionModal.module.css';
import { getApiBase } from '../utils/api';
import axios from 'axios';
import Head from 'next/head';

const AcquisitionModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  
  // Execute reCAPTCHA when form is being submitted
  const executeRecaptcha = async () => {
    if (typeof window !== 'undefined' && window.grecaptcha) {
      try {
        const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {action: 'submit_inquiry'});
        setRecaptchaToken(token);
        return token;
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        return '';
      }
    }
    return '';
  };
  
  // Validation schemas for each step with consent checkbox
  const validationSchemas = [
    // Step 1: Collection experience (now with checkbox UI but still single-select)
    Yup.object({
      collectionExperience: Yup.string().required('Please select an option'),
    }),
    // Step 2: Inquiry type
    Yup.object({
      inquiryType: Yup.string().required('Please select an option'),
    }),
    // Step 3: Acquisition goals (now checkboxes - multi-select)
    Yup.object({
      acquisitionGoals: Yup.array()
        .min(1, 'Please select at least one option')
        .required('Please select at least one option'),
    }),
    // Step 4: Collection tier
    Yup.object({
      collectionTier: Yup.string().required('Please select an option'),
    }),
    // Step 5: Inquiry role (now checkboxes - multi-select)
    Yup.object({
      inquiryRoles: Yup.array()
        .min(1, 'Please select at least one option')
        .required('Please select at least one option'),
    }),
    // Step 6: Contact information with consent checkbox
    Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string(),
      comments: Yup.string(),
      consent: Yup.boolean().oneOf([true], 'You must consent to the privacy policy')
    }),
  ];
  
  // Questions for each step
  const steps = [
    {
      title: '1. HAVE YOU COLLECTED ORIGINAL ART BEFORE?',
      fieldName: 'collectionExperience',
      isSingleSelectCheckbox: true,
      options: [
        { value: 'experienced', label: 'YES - I collect regularly and seek serious acquisitions.' },
        { value: 'beginner', label: 'YES - I\'m early in my journey, but discerning.' },
        { value: 'new', label: 'NO - But I\'m eager to start collecting with intention.' },
      ]
    },
    {
      title: '2. ARE YOU INQUIRING ABOUT A SPECIFIC WORK OR OPEN TO OTHERS?',
      fieldName: 'inquiryType',
      isSingleSelectCheckbox: true,
      options: [
        { value: 'specific', label: 'I\'m interested in a specific piece' },
        { value: 'open', label: 'I\'m open to existing and future works' },
        { value: 'both', label: 'Both / Undecided' },
      ]
    },
    {
      title: '3. WHICH OF THE FOLLOWING REFLECT YOUR ACQUISITION GOALS?',
      fieldName: 'acquisitionGoals',
      isCheckboxes: true,
      isMultiSelect: true,
      options: [
        { value: 'investment', label: 'Rarity and investment value' },
        { value: 'legacy', label: 'Legacy and long-term vision' },
        { value: 'personal', label: 'Personal resonance and emotional pull' },
        { value: 'conceptual', label: 'Conceptual or narrative-driven works' },
      ]
    },
    {
      title: '4. WHICH ACQUISITION TIER BEST ALIGNS WITH YOUR CURRENT STRATEGY?',
      fieldName: 'collectionTier',
      isSingleSelectCheckbox: true,
      options: [
        { value: 'tier1', label: '$50K — $250K+' },
        { value: 'tier2', label: '$25K — $50K' },
        { value: 'tier3', label: '$5K — $25K' },
        { value: 'tier4', label: 'Up to $5K' },
      ]
    },
    {
      title: '5. WHICH ROLE BEST DESCRIBES YOUR INQUIRY?',
      fieldName: 'inquiryRoles',
      isCheckboxes: true,
      isMultiSelect: true,
      options: [
        { value: 'personal', label: 'For my personal collection' },
        { value: 'representing', label: 'Representing a collector' },
        { value: 'advisor', label: 'Curator or art advisor' },
        { value: 'institutional', label: 'Institutional interest / public collection' },
        { value: 'other', label: 'Other' },
      ]
    },
    {
      title: '6. CONTACT INFORMATION',
      fieldName: 'contactInfo',
      isContactForm: true,
      isFinalStep: true,
      showPrevious: true
    },
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
      // For development testing, we'll set submitted to true without API call
      // In production, uncomment the API call below
      // const apiBase = getApiBase();
      // const response = await axios.post(`${apiBase}/submitInquiry`, values);
      // console.log('Form submitted successfully:', response.data);
      
      // Set submitted state to true to show thank you message
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Combined handler that either moves to next step or submits form
  const handleSubmit = async (values, { setSubmitting }) => {
    if (currentStep < steps.length - 1) {
      handleNextStep(values);
      setSubmitting(false);
    } else {
      try {
        // Check honeypot field - if it's filled, silently reject but show success to the bot
        if (values.phoneExtension) {
          console.log('Honeypot triggered - likely bot submission');
          // Fake success but don't actually submit
          setSubmitted(true);
          return;
        }
        
        // Format the form data for submission
        const formattedData = {
          // Contact information
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || '',
          message: values.comments || '',
          
          // Form data as structured information
          formData: {
            collectionExperience: values.collectionExperience,
            inquiryType: values.inquiryType,
            acquisitionGoals: values.acquisitionGoals,
            collectionTier: values.collectionTier,
            inquiryRoles: values.inquiryRoles
          },
          
          // Add form metadata
          submittedAt: new Date().toISOString(),
          consentGiven: values.consent,
          source: 'website_acquisition_form'
        };
        
        // Get reCAPTCHA token
        const token = await executeRecaptcha();
        
        // Get the API base path
        const apiBase = getApiBase();
        console.log('Submitting form data:', formattedData);
        
        // Submit the data to the API with reCAPTCHA token
        const response = await axios.post(`${apiBase}/submitInquiry`, {
          ...formattedData,
          recaptchaToken: token
        });
        
        console.log('Form submitted successfully:', response.data);
        
        // Show thank you message
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your inquiry. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  // Close the modal and reset state
  const closeModal = () => {
    onClose();
  };
  
  // Load reCAPTCHA script
  useEffect(() => {
    // Only load reCAPTCHA if we're in the browser and it's not already loaded
    if (typeof window !== 'undefined' && !window.grecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      {/* Include reCAPTCHA badge attribution */}
      <Head>
        <style>{`
          .grecaptcha-badge { visibility: hidden; }
        `}</style>
      </Head>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className={styles.thankYou}>
            <button onClick={closeModal} className={styles.closeButton}>✕</button>
            <h2 className={styles.modalHeading}>THANK YOU FOR YOUR INTEREST</h2>
            <p>
              DUE TO HIGH DEMAND, EACH APPLICANT IS CONSIDERED CAREFULLY. WE'LL BE IN TOUCH IF WE FEEL IT'S THE RIGHT FIT.
            </p>
          </div>
        ) : (
          <Formik
            initialValues={{
              collectionExperience: '',
              inquiryType: '',
              acquisitionGoals: [],
              collectionTier: '',
              inquiryRoles: [],
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              comments: '',
              consent: false,
              phoneExtension: '', // Honeypot field
            }}
            enableReinitialize={false}
            validateOnChange={false}
            validateOnBlur={true}
            validationSchema={validationSchemas[currentStep]}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, errors, touched, setFieldValue }) => {
              // Check if the current step's field has a value (is selected)
              // This determines if the Next button should have the active style
              const currentFieldName = steps[currentStep].fieldName;
              const isOptionSelected = Boolean(values[currentFieldName]);
              const isContactFormValid = currentStep === steps.length - 1 && 
                Boolean(values.firstName) && 
                Boolean(values.lastName) && 
                Boolean(values.email) && 
                Boolean(values.consent);
                
              return (
                <Form>
                  <button className={styles.closeButton} onClick={closeModal}>×</button>
                  {!steps[currentStep].isFinalStep && (
                    <h2 className={styles.modalHeading}>ACQUISITION INQUIRY</h2>
                  )}
                  
                  <div className={styles.stepContainer}>
                    <h3 className={styles.stepHeading}>{steps[currentStep].title}</h3>
                    
                    {steps[currentStep].isMultiSelect && (
                      <div className={styles.multiSelectNote}>Check all that apply</div>
                    )}
                    
                    {steps[currentStep].isContactForm ? (
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
                          
                          {/* Honeypot field - invisible to users but bots will fill it */}
                          <div className={styles.honeypotField} aria-hidden="true">
                            <label htmlFor="phoneExtension">Phone Extension (leave this empty)</label>
                            <Field 
                              type="text" 
                              name="phoneExtension" 
                              id="phoneExtension" 
                              tabIndex="-1"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="comments">ANYTHING YOU WISH TO ADD (optional)</label>
                          <Field 
                            as="textarea" 
                            name="comments" 
                            id="comments" 
                            className={styles.textInput}
                            style={{ minHeight: '70px', resize: 'none', maxHeight: '70px', width: '100%' }}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <div className={`${styles.checkboxOptionLabel} ${styles.consentContainer}`}>
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
                          <div className={styles.recaptchaDisclosure}>
                            This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className={styles.options}>
                          {steps[currentStep].isCheckboxes ? (
                            // Multi-select checkbox version for questions 3 and 5
                            steps[currentStep].options.map((option, idx) => (
                              <div key={idx} className={styles.checkboxContainer}>
                                <label className={`${styles.optionLabel} ${styles.checkboxOptionLabel} ${values[steps[currentStep].fieldName]?.includes(option.value) ? styles.selected : ''}`}>
                                  <Field 
                                    type="checkbox" 
                                    name={steps[currentStep].fieldName} 
                                    value={option.value} 
                                    className={styles.checkboxInput}
                                  />
                                  <span className={styles.optionLabelText}>{option.label}</span>
                                </label>
                              </div>
                            ))
                          ) : steps[currentStep].isSingleSelectCheckbox ? (
                            // Single-select checkbox version for the first question
                            steps[currentStep].options.map((option, idx) => (
                              <div key={idx} className={styles.checkboxContainer}>
                                <label 
                                  className={`${styles.optionLabel} ${styles.checkboxOptionLabel} ${values[steps[currentStep].fieldName] === option.value ? styles.selected : ''}`}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={values[steps[currentStep].fieldName] === option.value}
                                    className={styles.checkboxInput}
                                    onChange={() => {
                                      // If already selected, deselect it
                                      if (values[steps[currentStep].fieldName] === option.value) {
                                        setFieldValue(steps[currentStep].fieldName, '');
                                      } else {
                                        // If selecting new option, deselect any others
                                        setFieldValue(steps[currentStep].fieldName, option.value);
                                      }
                                    }}
                                  />
                                  <span className={styles.optionLabelText}>{option.label}</span>
                                </label>
                              </div>
                            ))
                          ) : (
                            // Radio button version for other single-select questions (2 and 4)
                            steps[currentStep].options.map((option, idx) => (
                              <label key={idx} className={`${styles.optionLabel} ${values[steps[currentStep].fieldName] === option.value ? styles.selected : ''}`}>
                                <Field 
                                  type="radio" 
                                  name={steps[currentStep].fieldName} 
                                  value={option.value} 
                                  className={styles.radioInput}
                                />
                                <span className={styles.optionLabelText}>{option.label}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className={`${styles.buttons} ${steps[currentStep].isFinalStep ? styles.finalStepButtons : ''}`}>
                  {(currentStep > 0 && (!steps[currentStep].isFinalStep || steps[currentStep].showPrevious)) && (
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
                    className={`${styles.button} ${(isOptionSelected || isContactFormValid) ? styles.selectedButton : ''} ${steps[currentStep].isFinalStep ? styles.completeButton : ''}`}
                  >
                    {steps[currentStep].isFinalStep ? 'COMPLETE' : 'NEXT'}
                  </button>
                </div>
              </Form>
            );
            }}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default AcquisitionModal;
