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

<code>say "Hello, World!"--</code>

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

<code>CAST string actor as "lead"--</code>

</td>
<td>

<code>let actor = "lead"</code>

</td>
</tr> </table>

### Type Conversion

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>

<code>RECAST actor into string--</code>

</td>
<td>

<code>let actor = String(actor)</code>

</td>
</tr> </table>

### Functions

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>
<code>SCENE int freeway has string fwy: 
    CAST string  fwy1 as "101"--
    CAST string fwy2 as "405"--
END SCENE
</code>

</td>
<td>
<code>function freeway(fwy){
    let fwy1 = "101"
    let fwy2 = "405"
}
</code>
</td>
</tr> </table>

### Loops

<table>
<tr> <th>blvd</th><th>JavaScript</th> </tr>
<tr>
<td>
<code>ACTION int stars in range from 1, 6:
    say stars--
</code>
</td>
<td>
<code>for(let stars = 1; stars < 6; stars++){
    console.log(stars)
}
</code>
</td>
</tr>

<td>
<code>CAST int rating as 1--
PERFORM rating <= 5:
    say "less than 5 stars"--
</code>
</td>
<td>
<code>let rating = 1
while(rating <= 5){
    console.log(rating)
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
    say "1 Star"--
RUNNER-UP review is 2:
    say "2 Stars"--
SUPPORTING:
    say "3 or more stars"--
</code>
</td>
<td>
<code>if(review == 1) {
    console.log("1 Star")
} 
else if(review == 2){
    console.log("2 Star")
} 
else {
    console.log("3 or more stars")
}
</code>
</td>
</tr> </table>
