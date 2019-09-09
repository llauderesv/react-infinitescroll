var faker = require('faker');

// Creates a dummy users generated using faker in nodejs
// You can used this to integrate in json-server
function generateEmployees() {
  var employees = [];
  for (var id = 1; id <= 200; id++) {
    var firstName = faker.name.firstName();
    var lastName = faker.name.lastName();
    var email = faker.internet.email();

    employees.push({
      id: id,
      first_name: firstName,
      last_name: lastName,
      email: email,
    });
  }

  return { employees: employees };
}
module.exports = generateEmployees;
