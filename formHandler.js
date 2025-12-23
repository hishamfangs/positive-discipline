(() => {
  // Individual PHP endpoints for each form type
  const formsConfig = [
    {
      id: 'egypt-workshop-form',
      endpoint: 'api/egypt-workshop.php',
      formType: 'egypt-workshop',
      formName: 'Egypt Workshop Booking',
      modalKey: 'egypt-workshop-modal',
      successMessage: 'Thank you for your interest! We will contact you soon to confirm your Egypt workshop booking.',
      transform: (data) => {
        const phoneInfo = normalizePhone(data);
        return {
          ...data,
          attendees: data.attendees ? Number(data.attendees) : undefined,
          location: 'Egypt',
          phone_raw: phoneInfo.raw,
          phone: phoneInfo.display,
          submittedAt: new Date().toISOString(),
          submittedFrom: window.location.href
        };
      },
      afterSuccess: () => {
        resetPhoneInput({
          flagSelector: '#egypt-workshop-flag',
          codeSelector: '#egypt-workshop-code',
          hiddenSelector: '#egypt-workshop-country-code',
          inputSelector: '#egypt-workshop-phone',
          flagClass: 'fi fi-eg',
          defaultCode: '+20',
          placeholder: 'XX XXXX XXXX'
        });
        triggerPriceUpdate('#egypt-workshop-form .number-spinner');
      }
    },
    {
      id: 'dubai-workshop-form',
      endpoint: 'api/dubai-workshop.php',
      formType: 'dubai-workshop',
      formName: 'Dubai Workshop Booking',
      modalKey: 'dubai-workshop-modal',
      successMessage: 'Thank you for your interest! We will contact you soon to confirm your Dubai workshop booking.',
      transform: (data) => {
        const phoneInfo = normalizePhone(data);
        return {
          ...data,
          attendees: data.attendees ? Number(data.attendees) : undefined,
          location: 'Dubai',
          phone_raw: phoneInfo.raw,
          phone: phoneInfo.display,
          submittedAt: new Date().toISOString(),
          submittedFrom: window.location.href
        };
      },
      afterSuccess: () => {
        resetPhoneInput({
          flagSelector: '#dubai-workshop-flag',
          codeSelector: '#dubai-workshop-code',
          hiddenSelector: '#dubai-workshop-country-code',
          inputSelector: '#dubai-workshop-phone',
          flagClass: 'fi fi-ae',
          defaultCode: '+971',
          placeholder: 'XX XXX XXXX'
        });
        triggerPriceUpdate('#dubai-workshop-form .number-spinner');
      }
    },
    {
      id: 'school-workshop-form',
      endpoint: 'api/school-workshop.php',
      formType: 'school-workshop',
      formName: 'School Workshop Inquiry',
      modalKey: 'school-workshop',
      successMessage: 'Thank you for your inquiry! We will contact you soon to discuss bringing Positive Discipline workshops to your school.',
      transform: (data) => {
        const phoneInfo = normalizePhone(data);
        return {
          ...data,
          phone_raw: phoneInfo.raw,
          phone: phoneInfo.display,
          submittedAt: new Date().toISOString(),
          submittedFrom: window.location.href
        };
      },
      afterSuccess: () => {
        resetPhoneInput({
          flagSelector: '#school-workshop-flag',
          codeSelector: '#school-workshop-code',
          hiddenSelector: '#school-workshop-country-code',
          inputSelector: '#school-workshop-phone',
          flagClass: 'fi fi-eg',
          defaultCode: '+20',
          placeholder: 'XX XXXX XXXX'
        });
      }
    },
    {
      id: 'contact-form',
      endpoint: 'api/contact.php',
      formType: 'contact',
      formName: 'Contact Form',
      successMessage: 'Thank you for reaching out! We will be in touch shortly.',
      useRecaptcha: true,
      recaptchaSiteKey: '6LeiqTQsAAAAALQgBODGUCEKaxV7NEIx3QsnA3Wm',
      transform: (data) => ({
        ...data,
        submittedAt: new Date().toISOString(),
        submittedFrom: window.location.href
      })
    }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    formsConfig.forEach((config) => setupForm(config));
  });

  function setupForm(config) {
    const form = document.getElementById(config.id);
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : null;
      toggleButtonState(submitButton, true, 'Sending…');

      try {
        // Get reCAPTCHA token if enabled for this form
        if (config.useRecaptcha && config.recaptchaSiteKey && typeof grecaptcha !== 'undefined') {
          try {
            const token = await grecaptcha.execute(config.recaptchaSiteKey, { action: 'contact_form' });
            const tokenInput = form.querySelector('#recaptcha-token');
            if (tokenInput) {
              tokenInput.value = token;
            }
          } catch (recaptchaError) {
            console.error('reCAPTCHA error:', recaptchaError);
            throw new Error('Security verification failed. Please refresh the page and try again.');
          }
        }

        const rawData = serializeForm(form);
        const transformedData = typeof config.transform === 'function' ? config.transform(rawData) : rawData;

        // Create FormData for PHP endpoints
        const formData = new FormData();
        Object.keys(transformedData).forEach(key => {
          if (transformedData[key] !== undefined && transformedData[key] !== null) {
            formData.append(key, transformedData[key]);
          }
        });

        const response = await fetch(config.endpoint, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorMessage = await extractErrorMessage(response);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Unable to submit the form. Please try again.');
        }

        alert(config.successMessage);
        form.reset();

        if (config.afterSuccess) {
          config.afterSuccess();
        }

        if (config.modalKey && typeof closeModal === 'function' && typeof modals !== 'undefined') {
          const modal = modals[config.modalKey];
          if (modal) {
            closeModal(modal);
          }
        }
      } catch (error) {
        console.error(`Form submission failed for ${config.formName}:`, error);
        alert(error.message || 'Sorry, there was a problem sending your request. Please try again.');
      } finally {
        toggleButtonState(submitButton, false, originalButtonText);
      }
    });
  }

  function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        data[key] = value.trim();
      } else {
        data[key] = value;
      }
    });

    return data;
  }

  function normalizePhone(data) {
    const countryCode = (data.country_code || '').trim();
    const rawNumber = (data.phone || '').replace(/\D+/g, '');

    return {
      raw: rawNumber,
      display: countryCode ? `${countryCode} ${rawNumber}`.trim() : rawNumber
    };
  }

  function resetPhoneInput(options) {
    if (!options) return;

    const {
      flagSelector,
      codeSelector,
      hiddenSelector,
      inputSelector,
      flagClass,
      defaultCode,
      placeholder
    } = options;

    const flag = document.querySelector(flagSelector);
    if (flag) {
      flag.innerHTML = `<span class="${flagClass}"></span>`;
    }

    const code = document.querySelector(codeSelector);
    if (code) {
      code.textContent = defaultCode;
    }

    const hidden = document.querySelector(hiddenSelector);
    if (hidden) {
      hidden.value = defaultCode;
    }

    const input = document.querySelector(inputSelector);
    if (input) {
      input.value = '';
      if (placeholder) {
        input.placeholder = placeholder;
      }
    }
  }

  function triggerPriceUpdate(selector) {
    if (!selector) return;
    const input = document.querySelector(selector);
    if (input) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function extractErrorMessage(response) {
    try {
      const data = await response.json();
      return data.message || response.statusText;
    } catch (error) {
      return response.statusText || 'Unknown error';
    }
  }

  function toggleButtonState(button, isLoading, loadingText) {
    if (!button) return;
    if (isLoading) {
      button.disabled = true;
      if (loadingText) {
        button.textContent = loadingText;
      }
    } else {
      button.disabled = false;
      if (loadingText) {
        button.textContent = loadingText;
      }
    }
  }
})();

