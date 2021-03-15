

// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value
        });

        /*

        sum = 0
        [200, 400, 100]
        sum = 0 + 200
        sum = 200 + 400
        sum = 600 + 100

        */

        // To store the sum
        data.totals[type] = sum;

    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // [1,2,3,4,5], next ID = 6
            // [1,2,3,4,5], next ID = 9
            // ID = last ID + 1


            // Create new ID
            if (data.allItems[type].length > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1

            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {

            var ids, index;

            // id = 30
            // data.allItems[type][]

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {

            // Sum of all income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp


            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1;
            }



            // Expense = 100 and income 300, spent 33.33 = 100/300 = 0.3333 * 100

        },

        calculatePercentages: function () {

            /*
            determining the individual percent
            if we have the following expenses
            a=200
            v=30
            g=50

            income = 3000

            percent a expense will be 
            (200/3000)*100 = aprox. 6.7%

            v will be 
            (30/3000)*100 = aprox. 1%

            The forEach method loops over an array and do thing 
            but The map method loops over an array works like forEach and return something and stores it in a variable.
            */

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
            
        },

        getPercentages:  function () {

            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;

        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data)
        }
    };

})();










// UI CONTROLLER
var UIController = (function () {

    // Domstrings make programmers lives easier enables quick update here instead of updating each methods when there is a change on the interface
    var DOMstrings = {
        inputType: '.outcome',
        inputDesc: '.desc',
        inputValue: '.value',
        inputBtn: '.add-btn',
        incomeContainer: '.income-list',
        expenseContainer: '.expense-list',
        budgetLabel: '.overall--amount',
        incomeLabel: '.income-amount',
        expensesLabel: '.exp-amount',
        percentageLabel: '.exp-percent',
        container: '.container',
        expensesPercLabel: '.item-percentage',
        dateLabel: '.budget-month'

    }

    var formatNumber = function (num, type) {
        /* + or - before number exactly 2 decimal points 
        comma separating the thousands
        
        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00 */

        num = Math.abs(num).toFixed(2);
        // num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 1) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int 
        + '.' + dec;

        
    };

    var nodeListForEach = function (list, callback) {

        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }

    };

    return {
        getInput: function () {

            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp 
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            }

        },


        addListItem: function (obj, type) {
            var html, newHtml, element;

            // Creat HTML string with placeholder text
            if (type == 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item-desc">%description%</div><div class="item-value">%value%</div><div class="item-delete"><button class="item-del-btn"><span style="color:#25a892; font-size:11pt"> &cross;</span></button></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item-desc">%description%</div><div class="item-value">%value%</div><div class="item-percentage">21%</div><div class="item-delete"><button class="item-del-btn"><span style="color:#25a892; font-size:11pt"> &cross;</span></button></div></div>';
            }

            // console.log(obj);
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id).replace('%description%', obj.description).replace('%value%', formatNumber(obj.value, type));



            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

            // console.log(newHtml);
        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);

        },

        // Clearing our input fields

        clearFields: function () {

            var fields, fieldsArr;


            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (cur, index, array) {

                cur.value = '';

            })

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {

            var type

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type); 
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp'); 


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }

        },

        displayMonth: function () {

            var now, months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' +year;

        },

            /////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////
            ////////// Need to understand this part it's not working  //////////////
            ///////////////////////////////////////////////////////

        changedType: function () {

            var fields = document.querySelectorAll( DOMstrings.inputType + ',' + DOMstrings.inputDesc + ',' + DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
                console.log(fields);
            });

            // document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

            
        },

        displayPercentages: function (percentages) {

            /* querySelector select the first element 
            but querySelectorAll selects all elements*/
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            /* This above returns a node list, 
            node list does not have the forEach function so 
            we have to create our own forEach function for a node list */

            ///////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////
            ////////// Need to understand this part  //////////////
            ///////////////////////////////////////////////////////
            

            nodeListForEach(fields, function (current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
            ///////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////

        },

        // Exposing the DOMstrings to make it public
        getDOMStrings: function () {
            return DOMstrings;
        }
    };

})();












// budgetController is not used within the controller to avoid repetition and frequent changes
// Instead its controller by the argument making the modules maintain their INDEPENDENCY.


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);


        // keypress listener happened mostly on the global scope

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.container).addEventListener('change', UICtrl.changedType());
    };


    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();


        // 2. Return the budget 
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);


    };

    var updatePercentage = function () {

        // 1. Calculate the percentage
        budgetCtrl.calculatePercentages();

        // 2. Read percentage from the budget CONTROLLER
        var percentages = budgetCtrl.getPercentages();


        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the filled input dates
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget CONTROLLER
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UICtrl
            // console.log(newItem);
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate the budget and update budget
            updateBudget();

            // 6. Calculate annd update percentages
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // inc-1 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // ID converted to number because

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate annd update percentages
            updatePercentage();


        }
    };

    return {
        init: function () {
            console.log('Application has started')
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }

})(budgetController, UIController);

controller.init();