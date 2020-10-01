function chunkArray(myArray, chunk_size){
	let index = 0
	let arrayLength = myArray.length
	let tempArray = []
    
	for (index = 0; index < arrayLength; index += chunk_size) {
		let myChunk = myArray.slice(index, index+chunk_size)
		tempArray.push(myChunk)
	}

	return tempArray
}

export default chunkArray