# Functional Programming

*Functional Programming, a course of the Tech-track of Information Design, thema semester of the third year from the study CMD. In this course I will learn to clean raw data so it becomes usable.*

### Deliverable

An interesting research case and question based on parking data in cities in The Netherlands, including a digital data visualisation.

*The client for this assignment is [de Volkskrant](https://www.volkskrant.nl/), a very popular and big Dutch newspaper*

## Research Question

### Which city is best to park with an electric car ?

*For this question I assume that parking facilities with electric car are mostly in bigger cities, and that these spaces will be more expensive than parking spaces without support for electric car charging*

**Sub questions**

* How many electric car charging parking spots are available for electric cars?

*I'm assuming that there are more electric car charging parking spots in prosperous cities*

* Where is the most support for electric car charging in parking facilities?

*I'm assuming that there is more support in bigger cities like Amsterdam or Utrecht than smaller cities.*

* How expensive is the parking facility?

*My assumption is that the parking facilities with support for electric car charging are more expensive than parking facilities without support for electric car charging.*

#### What data am I going to need?

* Charging points, areaid and capacity from [this dataset](https://opendata.rdw.nl/resource/b3us-f26s.json?$where=chargingpointcapacity>0)
* Location of parking facilities from [this dataset](https://opendata.rdw.nl/resource/b3us-f26s.json)
* The uuid of the facility from [this dataset](https://opendata.rdw.nl/resource/mz4f-59fw.json)
* Tariffs from [this dataset](https://npropendata.rdw.nl/parkingdata/v2/)

## Installation

*Installation guide on how to use this project*

### Requirements

* NodeJS
* NPM

### Installing

*Put the following lines of `code` in your terminal*

**1. Clone the repository**

```
git clone https://github.com/tsjuusmei/functional-programming.git
```

**2. Change directory to the folder**

```
cd ./functional-programming
```

**3. Install NPM packages**

```
npm install
```

**4. Run the project**

```
node -r esm index.js
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
