var budgetController = (function () {

    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercent = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
    };
    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Incomes = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.total[type] = sum;
           
    }
   
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            
            // Create new ID

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // Create new item based on 'inc' or 'éxp'
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Incomes(ID, des, val)
            }
            // push into our data structure
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
            
        },
        // A public method tha calculates totals, budget and percentage

        calculateBudget: function () {
            // Calculate total Income and Expense
            calculateTotal('inc');
            calculateTotal('exp')

            // Calculate the Budget: Total Income - Total Expense
            data.budget = data.total.inc - data.total.exp;

            // Calculate the percentage of income that we spent
           
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercent(data.total.inc);
            })
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
               budget: data.budget,
               totalInc: data.total.inc,
               totalExp: data.total.exp,
               percentage: data.percentage, 
            }
        },

        deleteItem: function(type, id) {
            var ids, index;
            // loops over the array and retures the index number e.g
            // [inc-1, inc-2, inc-3] === [0,1,2]
            ids = data.allItems[type].map(function(current) {
               return current.id;
            });
            // index of inc-1 === 0
            index = ids.indexOf(id);
            
            // splices it at id = 0;
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
         
        testing: function () {
            console.log(data);
        }
    }

})();




var UIController = (function () {
    // GET THE FIELD INPUT DATA
    var DOMstrings = {
        type: '.add__type',
        desc: '.add__description',
        val: '.add__value',
        but: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        percentageValue: '.budget__expenses--percentage',
        container: '.container',
        percContainer: '.item__percentage',
        DateContainer: '.budget__title--month'
    };

    var nodeListforEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    var formatNumber = function(type, num) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);
    
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        };

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        
    };

    return {
        getInput: function () {

            return {
                type: document.querySelector(DOMstrings.type).value,
                description: document.querySelector(DOMstrings.desc).value,
                value: parseFloat(document.querySelector(DOMstrings.val).value)
            };
        },

        addnewList: function (obj, type) {
            var html1, newHtml, element, type;

            // create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeList;
                html1 = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseList;
                html1 = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
           
            // replace placeholder with actual code
            
            newHtml = html1.replace("%id%", obj.id);

            newHtml = newHtml.replace("%description%", obj.description);

            newHtml = newHtml.replace("%value%", formatNumber(type, obj.value));

            // insert the HTML into the dom

            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        // delete the item list on the UI
        deleteItemList: function(selectorID) {
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

            // Clear the fields
        clearFields: function () {
            var field, fieldArr;
            field = document.querySelectorAll(DOMstrings.desc + ', ' + DOMstrings.val);

            fieldArr = Array.prototype.slice.call(field);

            fieldArr.forEach(function(curr, index, wholeArray) {
                curr.value = "";
            });

            // Focus on description Field
            fieldArr[0].focus();
        },

        displayBudget: function(object) {
            object.budget >= 0 ? type = 'inc' : type = 'exp'; 
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(type, object.budget);
            document.querySelector(DOMstrings.incomeValue).textContent = formatNumber('inc', object.totalInc);
            document.querySelector(DOMstrings.expenseValue).textContent = formatNumber('exp', object.totalExp);
            if (object.percentage > 0) {
                document.querySelector(DOMstrings.percentageValue).textContent = object.percentage + '%';
            }  else {
             document.querySelector(DOMstrings.percentageValue).textContent = '---';
           };
            
           
        },

        displayPercentages: function(percentages) {
            var Fields = document.querySelectorAll(DOMstrings.percContainer);

            nodeListforEach(Fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '---'
                }
            });

        },

        displayDate: function(){
            var now, year, month, months;
            now = new Date();

            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();

            document.querySelector(DOMstrings.DateContainer).textContent = months[month] + ', ' + year;
        },

        changedType: function() {
            var InputField = document.querySelectorAll(DOMstrings.type + ',' + DOMstrings.desc + ',' + DOMstrings.val);

            nodeListforEach(InputField, function(curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.but).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }

})();


var controller = (function (budgetctrl, UICtrl) {

    var setEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.but).addEventListener('click', ctrlAddNew);
        
        document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13) {
        ctrlAddNew();
        }
});

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItems);
    document.querySelector(DOM.type).addEventListener('change', UICtrl.changedType);

    };

    var updatePercentages = function() {
        // 1. calculate the percentage
        budgetctrl.calculatePercentage();
        // 2. return the percentage
        var retPer = budgetctrl.getPercentages();
        // 3. display the % in the UI
        UICtrl.displayPercentages(retPer);
    };

    var updateBudget = function () {
        // 4. Calculate the budget
        budgetctrl.calculateBudget();
        
        // Return the budget

        var budget = budgetctrl.getBudget();

        // 5. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    var ctrlAddNew = function () {
        var Input, newI, UIa;

        // 1. Get the field input data by calling the getInput() method;
       Input = UICtrl.getInput();
    
        // If description is not empty, value is not a number and value is greater tha zero,
        // run the lines of code
        if (Input.description !== "" && !isNaN(Input.value) && Input.value > 0) {
       
        // 2. Add te Item to the budget Controller
            newI = budgetctrl.addItem(Input.type, Input.description, Input.value);
    
        // 3. Add the Item to the UI
            UIa = UICtrl.addnewList(newI, Input.type);
    
        // clearfields
            UICtrl.clearFields();
    
        // Call Update Budget to update budget
    
            updateBudget();

        // Call UpdatePercentages to update percenta
            updatePercentages();
        }
    };

    var ctrlDeleteItems = function (eventClick) {
        var itemID, splitID, type, ID;

        itemID = eventClick.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // Split ItemID into two different i.e inc-0 = {'inc', 0}, splitID[0 & 1] reps first and 2nd element in the array!
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete The Item from the data Structure

            budgetctrl.deleteItem(type, ID);

            // 2. Delete the item from the UI

            UICtrl.deleteItemList(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // // Call UpdatePercentages to update percenta
            updatePercentages();
        }
    }

    return {
        init: function () {
            setEventListeners();
            console.log('App Started!')
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1});
        }


    }



})(budgetController, UIController);

controller.init();