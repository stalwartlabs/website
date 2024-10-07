---
sidebar_position: 4
---

# Expressions

The expression extension introduces the ability to evaluate arithmetical and logical operations within Sieve scripts. This is particularly useful for performing calculations on variables or determining the flow based on specific logical conditions.
Expressions can be evaluated using the `eval` test or the `let` and `while` instructions. In order to use these features, the `vnd.stalwart.expressions` extension must be enabled in the script.

The following operators are supported by the expression extension:

- **Arithmetical:**
    - `+`: Addition
    - `-`: Subtraction
    - `/`: Division
    - `*`: Multiplication
    
- **Logical:**
    - `&&`: Logical AND
    - `||`: Logical OR
    - `^`: Logical XOR
    - `!`: Logical NOT
    
- **Comparison:**
    - `>`: Greater than
    - `<`: Less than
    - `=`: Equal to
    - `!=`: Not equal to
    - `>=`: Greater than or equal to
    - `<=`: Less than or equal to

When working with logical and comparison operators, it is crucial to ensure that the data types being compared are compatible. For instance, comparing a string to a number using an operator like `>` may not yield the expected results. Always ensure that the variables and constants in your expressions have expected and consistent types to avoid unexpected behaviors.

## Using the `eval` test

Expressions can be evaluated using the `eval` test. This test evaluates the expression within the quotes and returns a boolean value based on the result.

```sieve
if eval "expression_here" {
    # Actions to be performed if the expression evaluates to true
}
```

In the following example, if the given mathematical expression results in a value greater than `2.25`, the message is rejected as SPAM.

```sieve
if eval "score + ((awl_score / awl_count) - score) * awl_factor > 2.25" {
    reject "Your message is SPAM.";
    stop;
}
```

## Using the `let` instruction

Expressions can also be evaluated and assigned to a variable using the `let` instruction. This instruction evaluates the expression within the quotes and assigns the result to the specified variable.

For example, to set a variable's value based on an evaluated expression:

```sieve
let "score" "score + ((awl_score / awl_count) - score) * awl_factor";
```

## Using the `while` instruction

The `while` instruction, available only from the [trusted interpreter](/docs/sieve/interpreter/trusted), allows you to execute a block of code repeatedly while a given condition is true. This instruction evaluates the expression within the quotes and executes the block of code if the result is true. The block of code is executed repeatedly until the expression evaluates to false. It is important to ensure that the expression eventually evaluates to false to avoid infinite loops. In order to use while loops, the `vnd.stalwart.while` extension must be enabled in the script.

```sieve
let "i" "10";
while "i > 0" {
    eval "print('Counter is ' + i)";
    let "i" "i - 1";
}
```

While loops can be terminated using the `break` instruction, which will immediately exit the loop and continue execution after the loop.

```sieve
let "i" "10";
while "true" {
    let "i" "i - 1";
    if eval "i == 0" {
        break;
    }
    eval "print('Counter is ' + i)";
}
```

The `continue` instruction can be used to skip the rest of the current iteration and continue with the next one.

```sieve
let "i" "10";
while "true" {
    let "i" "i - 1";
    if eval "contains([1, 3, 5, 7, 9], i)" {
        continue;
    }
    eval "print('Counter is ' + i)";
}
```

