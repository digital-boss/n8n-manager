docker/build:
	docker build -t maestrow/8man:latest .

docker/push:
	docker push maestrow/8man:latest

clean:
	rm -rf ./workflows/*