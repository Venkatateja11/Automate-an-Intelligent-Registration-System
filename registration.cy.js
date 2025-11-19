describe('Registration Form - Frugal Testing', () => {
  const url = '/index.html';

  beforeEach(() => {
    cy.visit(url);
  });

  it('Automation Flow A — Negative Scenario', () => {
    // 1. Launch page
    // 2. Print URL + Title
    cy.url().then(u => cy.log(`URL: ${u}`));
    cy.title().then(t => cy.log(`Title: ${t}`));

    // 3. Fill form with Last Name skipped
    cy.get('#firstName').type('Amit');
    cy.get('#lastName').clear(); // skipped
    cy.get('#email').type('amit@example.com');
    cy.get('#country').select('India');
    cy.get('#phone').type('+91 9876543210');
    cy.get('input[name="gender"][value="Male"]').check({ force: true });
    cy.get('#address').type('Vaghodia, Vadodara, GJ');
    cy.get('#password').type('StrongPass1!');
    cy.get('#confirmPassword').type('StrongPass1!');
    cy.get('#terms').check({ force: true });

    // 4. Click Submit
    cy.get('#submitBtn').click();

    // 5. Validate: Error message for missing Last Name + error fields highlighted
    cy.get('#lastNameError').should('contain', 'Last name is required.');
    cy.get('#lastName').parent().should('have.class', 'invalid');

    // 6. Capture Screenshot
    cy.screenshot('error-state');
  });

  it('Automation Flow B — Positive Scenario', () => {
    // 1. Refill with valid fields
    cy.get('#firstName').type('Amit');
    cy.get('#lastName').type('Shah');
    cy.get('#email').type('amit.shah@example.com');
    cy.get('#country').select('India');
    cy.get('#state').should('be.enabled').select('Gujarat');
    cy.get('#city').should('be.enabled').select('Vaghodia');
    cy.get('#phone').type('+91 9876543210');

    // 2. Password & Confirm match
    cy.get('#password').type('StrongPass1!');
    cy.get('#confirmPassword').type('StrongPass1!');

    // 3. Terms checked
    cy.get('#terms').check({ force: true });

    // 4. Submit
    cy.get('#submitBtn').click();

    // 5. Validate success message + form reset
    cy.get('#formAlert').should('have.class', 'success')
      .and('contain', 'Registration Successful!');
    cy.get('#successModal').should('not.have.class', 'hidden');

    // After modal appears, the form resets
    cy.get('#firstName').should('have.value', '');
    cy.get('#lastName').should('have.value', '');

    // 6. Screenshot
    cy.screenshot('success-state');

    // Close success modal for cleanliness
    cy.get('#successClose').click();
    cy.get('#successModal').should('have.class', 'hidden');
  });

  it('Automation Flow C — Form Logic Validation', () => {
    // 1. Change Country → States update
    cy.get('#country').select('United States');
    cy.get('#state').should('be.enabled').find('option').should('contain.text', 'California');

    // 2. Change State → Cities update
    cy.get('#state').select('California');
    cy.get('#city').should('be.enabled').find('option').should('contain.text', 'San Francisco');

    // 3. Password strength validated
    cy.get('#password').type('abc'); // weak
    cy.get('#strengthLabel').should('contain', 'Weak');
    cy.get('#password').clear().type('abcD1234'); // medium/strong depending on symbols
    cy.get('#strengthLabel').should('match', /Strength: (Medium|Strong)/);

    // 4. Wrong confirm password → error must appear
    cy.get('#confirmPassword').type('Mismatch123');
    cy.get('#confirmPasswordError').should('contain', 'Passwords do not match.');

    // 5. Submit disabled until valid
    cy.get('#submitBtn').should('be.disabled');

    // Make valid
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Doe');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#phone').type('+1 5551234567');
    cy.get('input[name="gender"][value="Male"]').check({ force: true });
    cy.get('#terms').check({ force: true });
    cy.get('#confirmPassword').clear().type('abcD1234');

    cy.get('#submitBtn').should('not.be.disabled');
  });
});
