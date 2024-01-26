<p align="left">
<img src="docs/logo.png">
</p>

# blvd

Introducing Blvd: A Cinematic Approach to Programming

Whether you are a Los Angeles native, visitor, or admirer, it's likely that you are familiar with the city's iconic entertainment destinations. Many of which are linked to the famous Sunset Boulevard.

Blvd is a statically-typed, object-oriented programming language whose syntax is influenced by movie scripts. With its simple design, Blvd allows you to be the creative director of your own programming projects.

Blvd is brought to you by [Gabrielle Barnes](https://github.com/gabrielle-barnes), [Funmi Idowu](https://github.com/Funmi-idowu), and [Kimberly Kubo](https://github.com/Kimberly-Kubo).

## Language Overview:

### Features:

- object oriented programming
- .blvd file extension
- parentheses can change the precedence of operators
- static, manifest typing
- data structures similar to lists and dictionaries
- reads like a script

### Comments:

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>

<code>(note: Genre: romance)</code>

</td>
<td>

<code>//Genre: romance</code>

</td>
</tr> </table>

## Example Programs:

### Hello World

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>

<code>say "Hello, World!"</code>

</td>
<td>

<code>console.log("Hello, World!")</code>

</td>
</tr> </table>

### Assigning Variables

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>

<code>MAKE string dog, "dog"</code>

</td>
<td>

<code>let dog = "dog"</code>

</td>
</tr> </table>

### Type Conversion

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>

<code>dog as string dog</code>

</td>
<td>

<code>let aDog = String(dog)</code>

</td>
</tr> </table>

### Functions

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>
<code>SCENE arithmetic has a, b: 
    MAKE int arit1, a + b
    MAKE int arit2, a * b
END SCENE
</code>

</td>
<td>

<code>function arithmetic(a, b){
    let arit1 = a + b
    let arit2 = a \* b
}
</code>

</td>
</tr> </table>

### Loops

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>

<code>ACTION i in range from 1, 6:
    say i
</code>

</td>
<td>

<code>for(let i = 1; i < 6; i++){
    console.log(i)
}
</code>

</td>
</tr>

<td>

<code>MAKE int i, 1
PERFORM i <= 5:
    say i
    i++
</code>

</td>
<td>

<code>let i = 1
while(i <= 5){
    console.log(i)
}
</code>

</td>
</tr> </table>

### Conditionals

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>

<code>NOMINATE review is 1:
    say "1 Star"
RUNNER-UP review is 2:
    say "2 Stars"
SUPPORTING:
    say "3 or more stars"
</code>

</td>
<td>

<code>if(review == 1) {
    console.log("1 Star")
} else if(review == 2){
    console.log("2 Star")
} else {
    console.log("3 or more stars")
}
</code>

</td>
</tr> </table>
